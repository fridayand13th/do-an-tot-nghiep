import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ChangePasswordDto, UpdateUserDto } from "./dto/user.dto";
import { Users } from "src/models";
import { UsersService } from "./users.service";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthRoleGuard } from "src/common/guards/authenticate.guard";
import { Roles } from "src/common/decorators/role.decorator";
import { ERoles } from "src/enums/base.enum";

@ApiTags("User")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Post("/change-password")
  @ApiOperation({ summary: "Thay đổi mật khẩu" })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Mật khẩu thay đổi thành công.",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Dữ liệu không hợp lệ",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Lỗi server.",
  })
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @Request() req) {
    const userId: number = req.user.id;
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  @Roles(ERoles.USER, ERoles.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Get("/profile")
  @ApiOperation({ summary: "Lấy thông tin của người dùng" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Lấy thông tin của người dùng thành công.",
    example: {
      success: true,
      data: {
        id: 2,
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.smith@example.com",
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Không tìm thấy người dùng",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Không có quyền truy cập.",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Lỗi server.",
  })
  async findOne(@Request() req): Promise<Users> {
    const userId: number = req.user.id;
    return await this.usersService.getUserInfo(userId);
  }

  @Roles(ERoles.USER)
  @UseGuards(AuthRoleGuard)
  @ApiBearerAuth()
  @Put("/profile")
  @ApiOperation({ summary: "Cập nhật thông tin của người dùng" })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Cập nhật thông tin thành công.",
    example: {
      success: true,
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Không có quyền truy cập.",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Lỗi server.",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Dữ liệu không hợp lệ",
  })
  async editUserInfo(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ): Promise<Boolean> {
    const userId: number = req.user.id;
    return this.usersService.editUser(updateUserDto, userId);
  }
}
