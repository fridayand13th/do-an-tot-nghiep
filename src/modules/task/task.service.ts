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
import {
  buildDateFilter,
  getUtcForLocalDayV2,
  getUtcRangeForLocalDay,
  IsEarlierEndDate,
  toUtcDate,
} from "src/utils/date";
import { clearJsonString, getPagination } from "src/utils/common";
import { GeminiService } from "src/shared/gemini/gemini.service";
import {
  readPrompt,
  suggestionPrompt,
  useCasePrompt,
} from "src/utils/gemini-prompt";
import {
  DELETE_TASK,
  EXIST_TASK_TIME,
  MISSING_CREATE_TASK_DATA,
  MISSING_TASK_DATA,
  NOT_FOUND_TASK,
} from "src/common/messages/task.message";
import {
  INVALID_PROMPT,
  VALIDATE_DATE_MESSAGE,
} from "src/common/messages/common.message";
import { UNEXPECTED_PROMPT } from "src/constants/base.constant";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MailService } from "../mail/mail.service";
import { EmailTemplateNames } from "../mail/mail.constants";
import { ErrorHelper } from "src/helpers/error.utils";

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

    if (
      startDate &&
      endDate &&
      !IsEarlierEndDate(new Date(startDate), new Date(endDate))
    ) {
      ErrorHelper.BadRequestException(VALIDATE_DATE_MESSAGE);
    }

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
      startDate: toUtcDate(startDate),
      endDate: toUtcDate(endDate),
    });
  }

  async updateTask(id: number, createTaskDto: CreateTaskDto, userId: number) {
    const { name, status, startDate, endDate } = createTaskDto;

    if (
      startDate &&
      endDate &&
      !IsEarlierEndDate(new Date(startDate), new Date(endDate))
    ) {
      ErrorHelper.BadRequestException(VALIDATE_DATE_MESSAGE);
    }

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
        startDate: toUtcDate(startDate),
        endDate: toUtcDate(endDate),
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
          [Op.gte]: toUtcDate(startDate),
          [Op.lte]: toUtcDate(endDate),
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
      order: [["startDate", "DESC"]],
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

      let useCase_prompt = useCasePrompt(prompt);

      const useCaseResponse = await this.geminiService.generateResponse(
        useCase_prompt
      );

      const clearUseCaseResponse = clearJsonString(useCaseResponse);

      const useCaseJsonRes = JSON.parse(clearUseCaseResponse);

      if (useCaseJsonRes.answer != "LMAO") {
        return {
          message: useCaseJsonRes.answer,
          method: null,
          task: null,
        };
      }

      prompt = await readPrompt(prompt);

      const response = await this.geminiService.generateResponse(prompt);
      const clearResponse = clearJsonString(response);
      const jsonRes = JSON.parse(clearResponse);

      if (jsonRes.response == UNEXPECTED_PROMPT) {
        return {
          message: INVALID_PROMPT,
          method: null,
          task: null,
        };
      }

      let {
        name,
        startDate,
        endDate,
        action,
        oldName,
        status,
        oldStartDate,
        oldEndDate,
      } = jsonRes;

      console.log("jsonRes", jsonRes);

      let parsedStartDate = startDate ? new Date(startDate) : null;
      let parsedEndDate = endDate ? new Date(endDate) : null;
      let parsedOldStartDate = oldStartDate ? new Date(oldStartDate) : null;
      let parsedOldEndDate = oldEndDate ? new Date(oldEndDate) : null;

      if (
        startDate &&
        endDate &&
        !IsEarlierEndDate(new Date(startDate), new Date(endDate))
      ) {
        ErrorHelper.BadRequestException(VALIDATE_DATE_MESSAGE);
      }

      if (
        oldStartDate &&
        oldEndDate &&
        !IsEarlierEndDate(new Date(oldStartDate), new Date(oldEndDate))
      ) {
        ErrorHelper.BadRequestException(VALIDATE_DATE_MESSAGE);
      }

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
              method: TaskAction.SUGGEST,
              task: {
                name: suggestName,
                startDate,
                endDate,
                status: TaskStatus.OPEN,
              },
              message: null,
            };
          }

          if (!name || !parsedStartDate || !parsedEndDate) {
            return {
              message: MISSING_CREATE_TASK_DATA,
              method: null,
              task: null,
            };
          }

          const newTask = await this.taskModel.create({
            userId,
            name,
            status: TaskStatus.OPEN,
            toDoDay,
            startDate: parsedStartDate,
            endDate: parsedEndDate,
          });

          return {
            method: TaskAction.CREATE,
            task: newTask,
            message: null,
          };

        case TaskAction.DELETE:
          return {
            message: DELETE_TASK,
            method: null,
            task: null,
          };

        case TaskAction.FIND:
          if (!name && !parsedStartDate && !parsedEndDate) {
            return {
              message: MISSING_TASK_DATA,
              method: null,
              task: null,
            };
          }
          if (parsedStartDate.getTime() === parsedEndDate.getTime()) {
            parsedEndDate.setDate(parsedEndDate.getDate() + 1);
          }

          if (name == "công việc" || name == "lịch") {
            name = null;
          }

          const task = await this.taskModel.findAll({
            where: {
              userId,
              ...(name && { name: { [Op.like]: `%${name}%` } }),
              ...(startDate && { startDate: { [Op.gte]: parsedStartDate } }),
              ...(endDate && { endDate: { [Op.lte]: parsedEndDate } }),
              ...(status && { status }),
            },
          });
          if (!task)
            return {
              message: NOT_FOUND_TASK,
              method: null,
              task: null,
            };
          return {
            method: TaskAction.FIND,
            task,
            message: null,
          };

        case TaskAction.UPDATE:
          if (!oldName || !parsedOldStartDate || !parsedOldEndDate) {
            return {
              message: MISSING_TASK_DATA,
              method: null,
              task: null,
            };
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
          if (!existingTask)
            return {
              message: NOT_FOUND_TASK,
              method: null,
              task: null,
            };
          if (taskFromDb && existingTask.id !== taskFromDb.id) {
            return {
              message: EXIST_TASK_TIME,
              method: null,
              task: null,
            };
          }

          const updatedTask = await existingTask.update({
            name: name || existingTask.name,
            startDate: parsedStartDate || existingTask.startDate,
            endDate: parsedEndDate || existingTask.endDate,
            toDoDay,
            status: status || existingTask.status,
          });

          return {
            method: TaskAction.UPDATE,
            task: updatedTask,
            message: null,
          };
      }
    } catch (error) {
      console.error("Error in CRUDTaskByGemini:", error);
      throw new InternalServerErrorException("Failed to process task request");
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_8PM)
  private async cronjobReminderUnfinishedTask() {
    const now = new Date();
    const { start: startDate, end: endDate } = getUtcRangeForLocalDay(now);

    const tasks = await this.getListUserHaveUnfinishedTask(startDate, endDate);

    await Promise.all(
      tasks.map(async (task) => {
        const userTask = await this.taskModel.findAll({
          where: {
            userId: task.userId,
            status: TaskStatus.OPEN,
            endDate: {
              [Op.gte]: startDate,
              [Op.lt]: endDate,
            },
          },
          raw: true,
        });

        await this.MailService.sendMail(
          task.user.email,
          EmailTemplateNames.REMINDER,
          {
            email: task.user.email || "",
            tasks: userTask,
            supportEmail: this.configService.get<string>("SUPPORT_EMAIL"),
          }
        );
      })
    );
  }

  private async getListUserHaveUnfinishedTask(startDate: Date, endDate: Date) {
    const tasks = await this.taskModel.findAll({
      attributes: [
        "userId",
        [Sequelize.fn("COUNT", Sequelize.col("Tasks.id")), "taskCount"],
      ],
      where: {
        status: TaskStatus.OPEN,
        endDate: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
      include: [{ model: Users, attributes: ["email"] }],
      group: ["userId", "user.id"],
      raw: true,
      nest: true,
    });

    return tasks;
  }

  private async getListUserHaveIncomingTask(startDate: Date, endDate: Date) {
    const tasks = await this.taskModel.findAll({
      attributes: [
        "userId",
        [Sequelize.fn("COUNT", Sequelize.col("Tasks.id")), "taskCount"],
      ],
      where: {
        status: TaskStatus.OPEN,
        startDate: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      include: [{ model: Users, attributes: ["email"] }],
      group: ["userId", "user.id"],
      raw: true,
      nest: true,
    });

    return tasks;
  }

  @Cron(CronExpression.EVERY_DAY_AT_8PM)
  private async cronjobRemindeInCommingTask() {
    const now = new Date();
    const nextDay = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0)
    );

    const { start: startDate, end: endDate } = getUtcRangeForLocalDay(nextDay);

    const tasks = await this.getListUserHaveIncomingTask(startDate, endDate);

    await Promise.all(
      tasks.map(async (task) => {
        const userTask = await this.taskModel.findAll({
          where: {
            userId: task.userId,
            status: TaskStatus.OPEN,
            startDate: {
              [Op.gte]: startDate,
              [Op.lte]: endDate,
            },
          },
          raw: true,
        });

        await this.MailService.sendMail(
          task.user.email,
          EmailTemplateNames.REMINDER_INCOMING_TASK,
          {
            email: task.user.email || "",
            tasks: userTask,
            supportEmail: this.configService.get<string>("SUPPORT_EMAIL"),
          }
        );
      })
    );
  }

  private async getListUserHaveIncomingTaskUnderOneHour(startDate: Date) {
    const tasks = await this.taskModel.findAll({
      attributes: [
        "userId",
        [Sequelize.fn("COUNT", Sequelize.col("Tasks.id")), "taskCount"],
      ],
      where: {
        status: TaskStatus.OPEN,
        startDate: startDate,
      },
      include: [{ model: Users, attributes: ["email"] }],
      group: ["userId", "user.id"],
      raw: true,
      nest: true,
    });

    return tasks;
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  private async cronjobRemindeInCommingTaskUnderOneHour() {
    const startDate = new Date();
    startDate.setUTCHours(
      startDate.getHours() + 1,
      startDate.getMinutes(),
      startDate.getSeconds(),
      0
    );

    const tasks = await this.getListUserHaveIncomingTaskUnderOneHour(startDate);

    await Promise.all(
      tasks.map(async (task) => {
        const userTask = await this.taskModel.findOne({
          where: {
            userId: task.userId,
            status: TaskStatus.OPEN,
            startDate,
          },
          raw: true,
        });

        await this.MailService.sendMail(
          task.user.email,
          EmailTemplateNames.REMINDER_INCOMING_TASK_UNDER_ONE_HOUR,
          {
            email: task.user.email || "",
            startDate: userTask.startDate,
            name: userTask.name,
            supportEmail: this.configService.get<string>("SUPPORT_EMAIL"),
          }
        );
      })
    );
  }
}
