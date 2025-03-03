import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, MaxLength } from "class-validator";
import {
  INVALID_END_DATE,
  INVALID_START_DATE,
  INVALID_TASK_NAME,
} from "src/common/messages/task.message";
import { TaskStatus } from "src/enums/task.enum";

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
