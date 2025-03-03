import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  HttpStatus,
  Request,
} from "@nestjs/common";
import { TaskService } from "./task.service";
import { CreateTaskDto } from "./dto/task.dto";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthRoleGuard } from "src/common/guards/authenticate.guard";
import { ChangePasswordDto } from "../users/dto/user.dto";

@ApiTags("Task")
@Controller("tasks")
@UseGuards(AuthRoleGuard)
@ApiBearerAuth()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: "Tạo công việc" })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Tạo công việc thành công.",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Dữ liệu không hợp lệ",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Lỗi server.",
  })
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    const userId: number = req.user.id;
    return this.taskService.createTask(createTaskDto, userId);
  }
}
