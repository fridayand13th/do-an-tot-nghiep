import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/sequelize";
import { Tasks, Users } from "src/models";
import {
  CreateTaskByGeminiDto,
  CreateTaskDto,
  GetAllTasksDto,
  SearchTasksDto,
} from "./dto/task.dto";
import { Sequelize, where } from "sequelize";
import { Op } from "sequelize";
import { SearchTaskStatus, TaskAction, TaskStatus } from "src/enums/task.enum";
import { buildDateFilter } from "src/utils/date";
import { clearJsonString, getPagination } from "src/utils/common";
import { GeminiService } from "src/shared/gemini/gemini.service";
import { readPrompt, suggestionPrompt } from "src/utils/gemini-prompt";
import {
  DELETE_TASK,
  EXIST_TASK_TIME,
  MISSING_CREATE_TASK_DATA,
  MISSING_TASK_DATA,
  NOT_FOUND_TASK,
} from "src/common/messages/task.message";
import { INVALID_PROMPT } from "src/common/messages/common.message";
import { UNEXPECTED_PROMPT } from "src/constants/base.constant";
import { Cron, CronExpression, Interval, Timeout } from "@nestjs/schedule";
import { MailService } from "../mail/mail.service";
import { EmailTemplateNames } from "../mail/mail.constants";
import moment from "moment-timezone";
const userTimeZone = "Asia/Bangkok";

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Tasks)
    private readonly taskModel: typeof Tasks,
    @InjectModel(Users)
    private readonly userModel: typeof Users,
    private configService: ConfigService,
    private readonly geminiService: GeminiService,
    private MailService: MailService
  ) {}

  async createTask(createTaskDto: CreateTaskDto, userId: number) {
    const { name, status, startDate, endDate } = createTaskDto;
    const toDoDay = new Date(startDate).getDate();

    const task = await this.findTaskByDate(startDate, endDate, userId);

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

  async updateTask(id: number, createTaskDto: CreateTaskDto, userId: number) {
    const { name, status, startDate, endDate } = createTaskDto;
    const toDoDay = new Date(startDate).getDate();

    const task = await this.findTaskByDate(startDate, endDate, userId);

    if (task && task.id !== id) {
      throw new BadRequestException(EXIST_TASK_TIME);
    }

    const updatedTask = await this.taskModel.update(
      {
        name: name.toLocaleLowerCase(),
        status,
        toDoDay,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      { where: { id } }
    );

    return updatedTask[0] > 0;
  }

  async deleteTask(id: number, userId: number) {
    return await this.taskModel.destroy({ where: { id, userId } });
  }

  async getTaskById(id: number, userId: number) {
    return await this.taskModel.findOne({ where: { id, userId } });
  }

  async getAllTasks(getAllTasksDto: GetAllTasksDto, userId: number) {
    const { startDate, endDate } = getAllTasksDto;
    const { page, take, offset } = getPagination(getAllTasksDto);
    const tasks = await this.taskModel.findAll({
      where: {
        userId,
        startDate: {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate),
        },
      },
      attributes: [
        "toDoDay",
        [Sequelize.literal(`JSON_AGG("Tasks")`), "tasks"],
      ],
      group: ["toDoDay"],
      order: [["toDoDay", "ASC"]],
    });

    return {
      items: tasks,
      count: 30,
      totalPage: Math.ceil(30 / take),
      currentPage: page,
      take,
    };
  }

  async findTaskByDate(startDate: string, endDate: string, userId: number) {
    return await this.taskModel.findOne({
      where: {
        userId,
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
        oldStartDate,
        oldEndDate,
      } = jsonRes;

      let parsedStartDate = startDate ? new Date(startDate) : null;
      let parsedEndDate = endDate ? new Date(endDate) : null;
      let parsedOldStartDate = oldStartDate ? new Date(oldStartDate) : null;
      let parsedOldEndDate = oldEndDate ? new Date(oldEndDate) : null;

      const toDoDay =
        parsedStartDate?.getDate() || parsedOldStartDate?.getDate();

      const [taskFromDb, taskList, user] = await Promise.all([
        this.findTaskByDate(startDate, endDate, userId),
        this.taskModel.findAll({
          where: {
            userId,
            startDate: {
              [Op.gte]: new Date(startDate)?.setHours(0, 0, 0, 0),
              [Op.lte]: new Date(startDate)?.setHours(23, 59, 59, 999),
            },
          },
        }),
        this.userModel.findOne({ where: { id: userId } }),
      ]);

      switch (action) {
        case TaskAction.CREATE:
          if (taskFromDb) {
            const suggestPrompt = await suggestionPrompt(
              name,
              user.hobby,
              taskList
            );

            const suggestTask = await this.geminiService.generateResponse(
              suggestPrompt
            );

            const { suggestName, startDate, endDate } = JSON.parse(
              clearJsonString(suggestTask)
            );

            return {
              name: suggestName,
              startDate,
              endDate,
              status: TaskStatus.OPEN,
            };
          }

          if (!name || !parsedStartDate || !parsedEndDate) {
            throw new BadRequestException(MISSING_CREATE_TASK_DATA);
          }

          return await this.taskModel.create({
            userId,
            name,
            status: TaskStatus.OPEN,
            toDoDay,
            startDate: parsedStartDate,
            endDate: parsedEndDate,
          });

        case TaskAction.DELETE:
          throw new BadRequestException(DELETE_TASK);

        case TaskAction.FIND:
          if (!name || !parsedStartDate || !parsedEndDate) {
            throw new BadRequestException(MISSING_TASK_DATA);
          }
          if (parsedStartDate.getTime() === parsedEndDate.getTime()) {
            parsedEndDate.setDate(parsedEndDate.getDate() + 1);
          }
          const task = await this.taskModel.findOne({
            where: {
              userId,
              name: { [Op.like]: `%${name}%` },
              startDate: { [Op.gte]: parsedStartDate, [Op.lte]: parsedEndDate },
              toDoDay,
            },
          });
          if (!task) throw new BadRequestException(NOT_FOUND_TASK);
          return task;

        case TaskAction.UPDATE:
          if (!oldName || !parsedOldStartDate || !parsedOldEndDate) {
            throw new BadRequestException(MISSING_TASK_DATA);
          }
          const existingTask = await this.taskModel.findOne({
            where: {
              userId,
              name: oldName,
              startDate: parsedOldStartDate,
              endDate: parsedOldEndDate,
              toDoDay,
            },
          });
          if (!existingTask) throw new BadRequestException(NOT_FOUND_TASK);
          if (taskFromDb && existingTask.id !== taskFromDb.id)
            throw new BadRequestException(EXIST_TASK_TIME);
          return await existingTask.update({
            name: name || existingTask.name,
            startDate: parsedStartDate || existingTask.startDate,
            endDate: parsedEndDate || existingTask.endDate,
            toDoDay,
            status: status || existingTask.status,
          });
      }
    } catch (error) {
      console.error("Error in CRUDTaskByGemini:", error);
      throw error.status
        ? error
        : new InternalServerErrorException("Failed to process task request");
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10PM)
  private async cronjobReminder() {
    const now = new Date();
    const start_of_day = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    );

    const tasks = await this.taskModel.findAll({
      attributes: [
        "userId",
        [Sequelize.fn("COUNT", Sequelize.col("Tasks.id")), "taskCount"],
      ],
      where: {
        status: TaskStatus.OPEN,
        endDate: {
          [Op.gte]: start_of_day,
          [Op.lt]: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
      include: [{ model: Users, attributes: ["email"] }],
      group: ["userId", "user.id"],
      raw: true,
      nest: true,
    });

    tasks.forEach((task) => {
      this.MailService.sendMail(task.user.email, EmailTemplateNames.REMINDER, {
        email: task.user.email || "",
        supportEmail: this.configService.get<string>("SUPPORT_EMAIL"),
      });
    });
  }
}
