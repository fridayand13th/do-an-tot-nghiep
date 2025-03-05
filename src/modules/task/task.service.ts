import { Injectable } from "@nestjs/common";
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
import { SearchTaskStatus, TaskStatus } from "src/enums/task.enum";
import { buildDateFilter } from "src/utils/date";
import { clearJsonString, getPagination } from "src/utils/common";
import { GeminiService } from "src/shared/gemini/gemini.service";
import { createTaskPrompt } from "src/utils/gemini-prompt";

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
    return await this.taskModel.create({
      userId,
      name,
      status,
      toDoDay,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
  }

  async updateTask(id: number, createTaskDto: CreateTaskDto) {
    const { name, status, startDate, endDate } = createTaskDto;
    const toDoDay = new Date(startDate).getDay() + 1;
    return await this.taskModel.update(
      {
        name,
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

  async searchTask(searchTasksDto: SearchTasksDto, userId: number) {
    let { name, status, startDate, endDate } = searchTasksDto;

    const { page, take, offset } = getPagination(searchTasksDto);

    if (status == SearchTaskStatus.ALL) {
      status = null;
    }

    const { rows: tasks, count: total } = await this.taskModel.findAndCountAll({
      where: {
        userId,
        name: {
          [Op.iLike]: `%${name}%`,
        },
        status: status,
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

  async createTaskByGemini(
    createTaskByGeminiDto: CreateTaskByGeminiDto,
    userId: number
  ) {
    let { prompt } = createTaskByGeminiDto;
    prompt = await createTaskPrompt(prompt);

    const response = await this.geminiService.generateResponse(prompt);

    const clearResponse = clearJsonString(response);
    const jsonRes = JSON.parse(clearResponse);

    const { name, startDate, endDate } = jsonRes;

    const toDoDay = new Date(startDate).getDay() + 1;

    return await this.taskModel.create({
      userId,
      name,
      status: TaskStatus.OPEN,
      toDoDay,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
  }
}
