import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ErrorHelper } from "src/helpers/error.utils";
import { TokenHelper } from "src/helpers/token.helper";
import { IToken } from "src/interfaces/auth.interface";
import { LoginDto } from "./dto/auth.dto";
import { UsersService } from "../users/users.service";
import * as USER_MESSAGE from "src/common/messages/user.message";
import { EncryptHelper } from "src/helpers/encrypt.helper";
import { MailService } from "../mail/mail.service";
import { Users } from "src/models";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/forgot-password.dto";
import { INVALID_TOKEN } from "src/common/messages/common.message";
import { v4 as uuidv4 } from "uuid";
import { SEVEN_DAYS } from "src/constants/base.constant";
import { EmailTemplateNames } from "../mail/mail.constants";
import { CreateUserDto } from "../users/dto/user.dto";
import { CacheService } from "src/shared/cache/cache.service";

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UsersService,
    private MailService: MailService,
    private cacheService: CacheService
  ) {}

  async refreshAccessToken(refreshToken: string) {
    const payload: IToken = TokenHelper.verify(
      refreshToken,
      this.configService.get("REFRESH_TOKEN_SECRET")
    );

    return this.generateToken({ id: payload.id, name: payload.name }, false);
  }

  async generateToken(payload: IToken, flag: boolean) {
    const secret: string = this.configService.get<string>(
      "ACCESS_TOKEN_SECRET"
    );
    const expiresIn: string = this.configService.get<string>(
      "ACCESS_TOKEN_EXPIRES_IN"
    );
    const { token: accessToken, expires } = TokenHelper.generate(
      payload,
      secret,
      expiresIn
    );
    let refreshToken: string | undefined;

    if (flag) {
      refreshToken = await this.generateRefreshToken(payload);
    }

    return {
      accessToken,
      expires,
      refreshToken,
    };
  }

  private async generateRefreshToken(payload: IToken): Promise<string> {
    const secret: string = this.configService.get<string>(
      "REFRESH_TOKEN_SECRET"
    );
    const expiresIn: string = this.configService.get<string>(
      "REFRESH_TOKEN_EXPIRES_IN"
    );
    const { token: refreshToken, expires } = TokenHelper.generate(
      payload,
      secret,
      expiresIn
    );
    return refreshToken;
  }

  async login(params: LoginDto) {
    const { password, email } = params;

    const user: Users = await this.userService.findByEmail(email);

    if (!user) {
      ErrorHelper.BadRequestException(USER_MESSAGE.WRONG_EMAIL);
    }

    const isPasswordValid = await EncryptHelper.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      ErrorHelper.BadRequestException(USER_MESSAGE.WRONG_PASSWORD);
    }

    return this.generateToken(
      {
        id: user.id,
        name: user.firstName + " " + user.lastName,
      },
      true
    );
  }

  async createNewRefreshToken(refreshToken: string) {
    const payload: IToken = TokenHelper.verify(
      refreshToken,
      this.configService.get("REFRESH_TOKEN_SECRET")
    );
    return this.generateRefreshToken({ id: payload.id, name: payload.name });
  }

  async resetPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const token: string = await this.userService.forgotPassword(email);
    const URL: string = this.configService.get<string>(
      "VERIFY_RESET_PASSWORD_URL"
    );
    const link: string = `${URL}${token}`;
    const response = await this.MailService.sendMail(
      email,
      EmailTemplateNames.RESET_PASSWORD,
      {
        email: email || "",
        link: link,
        supportEmail: this.configService.get<string>("SUPPORT_EMAIL"),
        duration:
          parseInt(
            this.configService.get<string>("RESET_TOKEN_EXPIRES_IN", "900")
          ) / 60,
      }
    );
    return response.response;
  }

  async verifyResetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    const { password } = resetPasswordDto;
    const secret: string = this.configService.get<string>("TOKEN_SECRET");
    const payload: IToken = TokenHelper.verify(token, secret);
    return await this.userService.verifyForgotPassword(payload, password);
  }

  async verifyToken(token: string) {
    const secret: string = this.configService.get<string>("TOKEN_SECRET");
    const payload: IToken = await TokenHelper.verify(token, secret);
    await this.cacheService.checkUsedToken(
      `user:${payload.id}:resetPasswordTokens`,
      token
    );
    return true;
  }
}
