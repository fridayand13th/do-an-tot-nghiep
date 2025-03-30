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
  Query,
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
  ApiQuery,
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
  update(
    @Param("id") id: number,
    @Body() createTaskDto: CreateTaskDto,
    @Request() req
  ) {
    const userId: number = req.user.id;
    return this.taskService.updateTask(id, createTaskDto, userId);
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
  delete(@Param("id") id: number, @Request() req) {
    const userId: number = req.user.id;
    return this.taskService.deleteTask(id, userId);
  }

  @Get(":id/detail")
  @ApiOperation({ summary: "Lấy thông tin công việc" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Lấy thông tin công việc thành công.",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Lỗi server.",
  })
  getTaskById(@Param("id") id: number, @Request() req) {
    const userId: number = req.user.id;
    return this.taskService.getTaskById(id, userId);
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
  getAllTasks(@Request() req, @Query() getAllTasksDto: GetAllTasksDto) {
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
  searchTask(@Request() req, @Query() searchTasksDto: SearchTasksDto) {
    const userId: number = req.user.id;
    return this.taskService.searchTask(searchTasksDto, userId);
  }

  @Post("/gemini-interact")
  @ApiOperation({ summary: "CRUD task bằng Gemini" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Thành công.",
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
  test(@Body() prompt: CreateTaskByGeminiDto, @Request() req) {
    const userId: number = req.user.id;
    return this.taskService.CRUDTaskByGemini(prompt, userId);
  }
}
