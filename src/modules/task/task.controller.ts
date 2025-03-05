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
import {
  CreateTaskByGeminiDto,
  CreateTaskDto,
  GetAllTasksDto,
  SearchTasksDto,
} from "./dto/task.dto";
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

  @Put(":id")
  @ApiOperation({ summary: "Cập nhật công việc" })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Cập nhật công việc thành công.",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Dữ liệu không hợp lệ",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Lỗi server.",
  })
  update(@Param("id") id: number, @Body() createTaskDto: CreateTaskDto) {
    return this.taskService.updateTask(id, createTaskDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Xóa công việc" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Xóa công việc thành công.",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Lỗi server.",
  })
  delete(@Param("id") id: number) {
    return this.taskService.deleteTask(id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Lấy thông tin công việc" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Lấy thông tin công việc thành công.",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Lỗi server.",
  })
  getTaskById(@Param("id") id: number) {
    return this.taskService.getTaskById(id);
  }

  @Get()
  @ApiOperation({ summary: "Lấy danh sách công việc" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Lấy danh sách công việc thành công.",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Lỗi server.",
  })
  @ApiBody({ type: GetAllTasksDto })
  getAllTasks(@Request() req, @Body() getAllTasksDto: GetAllTasksDto) {
    const userId: number = req.user.id;
    return this.taskService.getAllTasks(getAllTasksDto, userId);
  }

  @Get("/search")
  @ApiOperation({ summary: "Tìm kiếm công việc" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Tìm kiếm công việc thành công.",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Lỗi server.",
  })
  @ApiBody({ type: SearchTasksDto })
  searchTask(@Request() req, @Body() searchTasksDto: SearchTasksDto) {
    const userId: number = req.user.id;
    return this.taskService.searchTask(searchTasksDto, userId);
  }

  @Post("/create-by-prompt")
  @ApiOperation({ summary: "Tạo công việc bằng Gemini" })
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
  @ApiBody({ type: CreateTaskByGeminiDto })
  createByPrompt(@Body() prompt: CreateTaskByGeminiDto, @Request() req) {
    const userId: number = req.user.id;
    return this.taskService.createTaskByGemini(prompt, userId);
  }
}
