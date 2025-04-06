import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LoginDto } from "./dto/auth.dto";
import { CreateUserDto } from "../users/dto/user.dto";
import { Users } from "src/models";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/forgot-password.dto";
import { UsersService } from "../users/users.service";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService
  ) {}

  @Post("/refresh-access-token")
  @ApiOperation({ summary: "Làm mới token truy cập" })
  refreshToken(@Query("refreshToken") refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post("/generate-refresh-token")
  generateRefreshToken(@Query("refreshToken") refreshToken: string) {
    return this.authService.createNewRefreshToken(refreshToken);
  }

  @Post("/login")
  @ApiOperation({ summary: "Đăng nhập" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Lỗi server.",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Dữ liệu không hợp lệ",
  })
  async login(@Body() payload: LoginDto) {
    const { accessToken, refreshToken } = await this.authService.login(payload);
    return { accessToken, refreshToken };
  }

  @Post("/register")
  @ApiOperation({ summary: "Đăng ký" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Đăng ký thành công.",
    type: CreateUserDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Lỗi server.",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Dữ liệu không hợp lệ",
  })
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.registerUser(createUserDto);
  }

  @Post("/forgot-password")
  @ApiOperation({ summary: "Quên mật khẩu" })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Gửi mail thành công.",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Lỗi server.",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Dữ liệu không hợp lệ",
  })
  resetPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.resetPassword(forgotPasswordDto);
  }

  @Post("/reset-password")
  @ApiOperation({ summary: "Đặt lại mật khẩu" })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Lỗi server.",
  })
  verifyResetPassword(
    @Query("token") token: string,
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    console.log("token", token);
    return this.authService.verifyResetPassword(token, resetPasswordDto);
  }

  @Get("/forgot-password/verify-token")
  @ApiOperation({ summary: "Xác thực token đặt lại mật khẩu" })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Lỗi server.",
  })
  verifyToken(@Query("token") token: string) {
    return this.authService.verifyToken(token);
  }
}
