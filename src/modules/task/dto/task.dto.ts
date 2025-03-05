import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, MaxLength } from "class-validator";
import { Op } from "sequelize";
import { PaginateDto } from "src/common/dto/common.dto";
import {
  INVALID_END_DATE,
  INVALID_START_DATE,
  INVALID_TASK_NAME,
} from "src/common/messages/task.message";
import { SearchTaskStatus, TaskStatus } from "src/enums/task.enum";

export class CreateTaskDto {
  @ApiProperty({ required: true, example: "Task 1" })
  @IsNotEmpty({ message: INVALID_TASK_NAME })
  @MaxLength(255, { message: INVALID_TASK_NAME })
  name: string;

  @ApiProperty({ required: true, example: TaskStatus.OPEN })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiProperty({ required: true, example: "2025-01-01" })
  @IsNotEmpty({ message: INVALID_START_DATE })
  startDate: string;

  @ApiProperty({ required: true, example: "2025-03-01" })
  @IsNotEmpty({ message: INVALID_END_DATE })
  endDate: string;
}

export class GetAllTasksDto {
  @ApiProperty({ required: true, example: "2025-01-01" })
  @IsNotEmpty({ message: INVALID_START_DATE })
  startDate: string;

  @ApiProperty({ required: true, example: "2025-03-01" })
  @IsNotEmpty({ message: INVALID_END_DATE })
  endDate: string;
}

export class SearchTasksDto extends PaginateDto {
  @ApiProperty({ required: false, example: "Task 1" })
  @IsOptional()
  name: string;

  @ApiProperty({ required: false, example: SearchTaskStatus.ALL })
  @IsOptional()
  @IsEnum(SearchTaskStatus)
  status: SearchTaskStatus;

  @ApiProperty({ required: false, example: "2025-01-01" })
  @IsOptional()
  startDate: string;

  @ApiProperty({ required: false, example: "2025-03-01" })
  @IsOptional()
  endDate: string;
}

export class CreateTaskByGeminiDto {
  @ApiProperty({ required: true, example: "Task 1" })
  @IsNotEmpty()
  prompt: string;
}
