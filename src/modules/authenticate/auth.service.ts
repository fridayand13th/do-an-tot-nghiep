import { Body, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ErrorHelper } from "src/helpers/error.utils";
import { TokenHelper } from "src/helpers/token.helper";
import { IToken } from "src/interfaces/auth.interface";
import { LoginDto } from "./dto/auth.dto";
import { UsersService } from "../users/users.service";
import * as USER_MESSAGE from "src/common/messages/user.message";
import { EncryptHelper } from "src/helpers/encrypt.helper";
import { ERoles } from "src/enums/base.enum";
import { CreateUserDto } from "../users/dto/user.dto";
import { AwsSesService } from "../aws-ses/aws-ses.service";
import { Users } from "src/models";
import { ESubject, ETemplate } from "src/enums/email.enum";
import { ForgotPasswordDto, ResetPasswordDto } from "./dto/forgot-password.dto";
import { CacheService } from "src/shared/cache/cache.service";
import { INVALID_TOKEN } from "src/common/messages/common.message";
import { v4 as uuidv4 } from "uuid";
import { SEVEN_DAYS } from "src/constants/base.constant";

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UsersService,
    private awsSesService: AwsSesService,
    private cacheService: CacheService
  ) {}

  async refreshAccessToken(refreshToken: string) {
    const user = await this.userService.findUserByRefreshToken(refreshToken);
    if (!user) {
      ErrorHelper.UnauthorizedException(INVALID_TOKEN);
    }

    return this.generateToken(
      { id: user.id, name: user.firstName + " " + user.lastName },
      false
    );
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
      refreshToken = uuidv4();
    }

    return {
      accessToken,
      expires,
      refreshToken,
    };
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

    const { accessToken, refreshToken, expires } = await this.generateToken(
      {
        id: user.id,
        name: user.firstName + " " + user.lastName,
      },
      true
    );

    const expiresIn = new Date((expires + SEVEN_DAYS) * 1000);

    console.log(expiresIn);

    await this.userService.updateUserToken(refreshToken, expiresIn, user.id);

    return {
      accessToken,
      refreshToken,
      expires,
    };
  }

  async resetPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const token: string = await this.userService.forgotPassword(email);
    const URL: string = this.configService.get<string>(
      "VERIFY_RESET_PASSWORD_URL"
    );
    const link: string = `${URL}${token}`;
    const body = await this.awsSesService.createTemplate(
      { email, link },
      ETemplate.EMAIL_RESET_PASSWORD
    );
    return await this.awsSesService.sendEmail(
      email,
      ESubject.RESET_PASSWORD,
      body
    );
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
