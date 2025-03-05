import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { TaskController } from "./task.controller";
import { Tasks } from "src/models";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsersModule } from "../users/users.module";
import { GeminiService } from "src/shared/gemini/gemini.service";

@Module({
  imports: [SequelizeModule.forFeature([Tasks]), UsersModule],
  providers: [TaskService, GeminiService],
  controllers: [TaskController],
  exports: [TaskService],
})
export class TaskModule {}
