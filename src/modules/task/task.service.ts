import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/sequelize";
import { Tasks } from "src/models";
import {
  CreateTaskByGeminiDto,
  CreateTaskDto,
  GetAllTasksDto,
  SearchTasksDto,
} from "./dto/task.dto";
import { where } from "sequelize";
import { Op } from "sequelize";
import { SearchTaskStatus, TaskAction, TaskStatus } from "src/enums/task.enum";
import { buildDateFilter } from "src/utils/date";
import { clearJsonString, getPagination } from "src/utils/common";
import { GeminiService } from "src/shared/gemini/gemini.service";
import { readPrompt } from "src/utils/gemini-prompt";
import {
  DELETE_TASK,
  EXIST_TASK_TIME,
  MISSING_TASK_DATA,
  NOT_FOUND_TASK,
} from "src/common/messages/task.message";
import { INVALID_PROMPT } from "src/common/messages/common.message";
import { UNEXPECTED_PROMPT } from "src/constants/base.constant";

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Tasks)
    private readonly taskModel: typeof Tasks,
    private configService: ConfigService,
    private readonly geminiService: GeminiService
  ) {}

  async createTask(createTaskDto: CreateTaskDto, userId: number) {
    const { name, status, startDate, endDate } = createTaskDto;
    const toDoDay = new Date(startDate).getDay() + 1;

    const task = await this.findTaskByDate(startDate, endDate);

    if (task) {
      throw new BadRequestException(EXIST_TASK_TIME);
    }

    return await this.taskModel.create({
      userId,
      name: name.toLocaleLowerCase(),
      status,
      toDoDay,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
  }

  async updateTask(id: number, createTaskDto: CreateTaskDto) {
    const { name, status, startDate, endDate } = createTaskDto;
    const toDoDay = new Date(startDate).getDay() + 1;

    const task = await this.findTaskByDate(startDate, endDate);

    if (task && task.id !== id) {
      throw new BadRequestException(EXIST_TASK_TIME);
    }

    return await this.taskModel.update(
      {
        name: name.toLocaleLowerCase(),
        status,
        toDoDay,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      { where: { id } }
    );
  }

  async deleteTask(id: number) {
    return await this.taskModel.destroy({ where: { id } });
  }

  async getTaskById(id: number) {
    return await this.taskModel.findByPk(id);
  }

  async getAllTasks(getAllTasksDto: GetAllTasksDto, userId: number) {
    const { startDate, endDate } = getAllTasksDto;
    return await this.taskModel.findAll({
      where: {
        userId,
        startDate: {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate),
        },
      },
      order: [["startDate", "ASC"]],
      group: ["toDoDay"],
    });
  }

  async findTaskByDate(startDate: string, endDate: string) {
    return await this.taskModel.findOne({
      where: {
        startDate: {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate),
        },
      },
    });
  }

  async searchTask(searchTasksDto: SearchTasksDto, userId: number) {
    let { name, status, startDate, endDate } = searchTasksDto;

    const { page, take, offset } = getPagination(searchTasksDto);

    if (status == SearchTaskStatus.ALL) {
      status = null;
    }

    const { rows: tasks, count: total } = await this.taskModel.findAndCountAll({
      where: {
        userId,
        ...(name && {
          name: {
            [Op.like]: `%${name.toLocaleLowerCase()}%`,
          },
        }),
        ...(status && { status }),
        ...buildDateFilter(startDate, endDate),
      },
      offset,
      limit: take,
      order: [["startDate", "ASC"]],
    });

    return {
      items: tasks,
      count: total,
      totalPage: Math.ceil(total / take),
      currentPage: page,
      take,
    };
  }

  async CRUDTaskByGemini(
    createTaskByGeminiDto: CreateTaskByGeminiDto,
    userId: number
  ) {
    try {
      let { prompt } = createTaskByGeminiDto;
      prompt = await readPrompt(prompt);

      const response = await this.geminiService.generateResponse(prompt);

      const clearResponse = clearJsonString(response);
      const jsonRes = JSON.parse(clearResponse);

      if (jsonRes.response == UNEXPECTED_PROMPT) {
        throw new BadRequestException(INVALID_PROMPT);
      }

      const {
        name,
        startDate,
        endDate,
        action,
        oldName,
        status,
        oldEndDate,
        oldStartDate,
      } = jsonRes;

      let parsedStartDate = startDate ? new Date(startDate) : null;
      let parsedEndDate = endDate ? new Date(endDate) : null;
      let parsedOldStartDate = oldStartDate ? new Date(oldStartDate) : null;
      let parsedOldEndDate = oldEndDate ? new Date(oldEndDate) : null;

      const toDoDay = (parsedStartDate || parsedOldStartDate)?.getDate();

      const taskFromDb = await this.findTaskByDate(startDate, endDate);

      if (action === TaskAction.CREATE) {
        if (taskFromDb) {
          throw new BadRequestException(EXIST_TASK_TIME);
        }

        return await this.taskModel.create({
          userId,
          name,
          status: TaskStatus.OPEN,
          toDoDay,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
        });
      }

      if (action === TaskAction.DELETE) {
        throw new BadRequestException(DELETE_TASK);
      }

      if (action === TaskAction.FIND) {
        if (!name || !parsedStartDate || !parsedEndDate) {
          throw new BadRequestException(MISSING_TASK_DATA);
        }

        if (parsedStartDate.getTime() === parsedEndDate.getTime()) {
          parsedEndDate = new Date(parsedStartDate);
          parsedEndDate.setDate(parsedEndDate.getDate() + 1);
        }

        const task = await this.taskModel.findOne({
          where: {
            userId,
            name: {
              [Op.like]: `%${name}%`,
            },
            startDate: {
              ...(parsedStartDate && { [Op.gte]: parsedStartDate }),
              ...(parsedEndDate && { [Op.lte]: parsedEndDate }),
            },
            toDoDay,
          },
        });

        if (!task) {
          throw new BadRequestException(NOT_FOUND_TASK);
        }

        return task;
      }

      if (action === TaskAction.UPDATE) {
        if (!oldName || !parsedOldStartDate || !parsedOldEndDate) {
          throw new BadRequestException(MISSING_TASK_DATA);
        }

        const task = await this.taskModel.findOne({
          where: {
            userId,
            name: oldName,
            startDate: parsedOldStartDate,
            endDate: parsedOldEndDate,
            toDoDay,
          },
        });

        if (!task) {
          throw new BadRequestException(NOT_FOUND_TASK);
        }

        if (taskFromDb && task.id !== taskFromDb.id) {
          throw new BadRequestException(EXIST_TASK_TIME);
        }

        return await task.update({
          name: name || task.name,
          startDate: parsedStartDate || task.startDate,
          endDate: parsedEndDate || task.endDate,
          toDoDay,
          status: status || task.status,
        });
      }
    } catch (error) {
      if (error.status) {
        throw error;
      }
      console.error("Error in Prompt:", error);
      throw new InternalServerErrorException("Failed to process task request");
    }
  }
}
