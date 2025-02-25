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
  refreshToken(@Query("refreshToken") refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post("/login")
  @ApiOperation({ summary: "Login" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal server error.",
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid input" })
  async login(@Body() payload: LoginDto) {
    const { accessToken, refreshToken } = await this.authService.login(payload);
    return { accessToken, refreshToken };
  }

  @Post("/register")
  @ApiOperation({ summary: "Register" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Register successfully.",
    type: CreateUserDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal server error.",
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid input" })
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.registerUser(createUserDto);
  }

  @Post("/forgot-password")
  @ApiOperation({ summary: "Forgot password" })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Send mail successfully.",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal server error.",
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid input" })
  resetPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.resetPassword(forgotPasswordDto);
  }

  @Post("/reset-password")
  @ApiOperation({ summary: "Reset password" })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal server error.",
  })
  verifyResetPassword(
    @Query("token") token: string,
    @Body() resetPasswordDto: ResetPasswordDto
  ) {
    return this.authService.verifyResetPassword(token, resetPasswordDto);
  }

  @Get("/forgot-password/verify-token")
  @ApiOperation({ summary: "Verify fogot password token" })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Internal server error.",
  })
  verifyToken(@Query("token") token: string) {
    return this.authService.verifyToken(token);
  }
}
