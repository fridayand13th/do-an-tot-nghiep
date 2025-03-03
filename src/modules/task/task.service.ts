import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/sequelize";
import { Tasks } from "src/models";
import { CreateTaskDto } from "./dto/task.dto";

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Tasks)
    private readonly taskModel: typeof Tasks,
    private configService: ConfigService
  ) {}

  async createTask(createTaskDto: CreateTaskDto, userId: number) {
    const { name, status, startDate, endDate } = createTaskDto;

    return await this.taskModel.create({
      userId,
      name,
      status,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
  }
}
