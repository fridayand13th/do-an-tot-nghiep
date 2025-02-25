import { Body, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorHelper } from 'src/helpers/error.utils';
import { TokenHelper } from 'src/helpers/token.helper';
import { IToken } from 'src/interfaces/auth.interface';
import { LoginDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import * as USER_MESSAGE from 'src/common/messages/user.message';
import { EncryptHelper } from 'src/helpers/encrypt.helper';
import { ERoles } from 'src/enums/base.enum';
import { CreateUserDto } from '../users/dto/user.dto';
import { AwsSesService } from '../aws-ses/aws-ses.service';
import { Users } from 'src/models';
import { ESubject, ETemplate } from 'src/enums/email.enum';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { CacheService } from 'src/shared/cache/cache.service';
// import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UsersService,
    // private redisService: RedisService,
    private awsSesService: AwsSesService,
    private cacheService: CacheService,
  ) {}

  async refreshAccessToken(
    refreshToken: string,
    //accessToken: string
  ) {
    const payload: IToken = TokenHelper.verify(refreshToken, this.configService.get('REFRESH_TOKEN_SECRET'));

    //  if ((await this.IsStoredRefreshtoken(refreshToken, payload.id)) !== 1) {
    //    ErrorHelper.UnauthorizedException('Invalid refresh token');
    //  }
    //  await this.redisService.srem(`user:${payload.id}:accessTokens`, accessToken);
    return this.generateToken({ id: payload.id, roles: payload.roles }, false);
  }

  //  private async IsStoredRefreshtoken(refreshToken: string, userId: number): Promise<Number> {
  //    return await this.redisService.sismember(`user:${userId}:refreshTokens`, refreshToken);
  //  }

  async generateToken(payload: IToken, flag: boolean) {
    const secret: string = this.configService.get<string>('ACCESS_TOKEN_SECRET');
    const expiresIn: string = this.configService.get<string>('ACCESS_TOKEN_EXPIRES_IN');
    const { token: accessToken, expires } = TokenHelper.generate(payload, secret, expiresIn);
    //await this.redisService.sadd(`user:${payload.id}:accessTokens`, accessToken);
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
    const secret: string = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    const expiresIn: string = this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN');
    const { token: refreshToken, expires } = TokenHelper.generate(payload, secret, expiresIn);
    //await this.redisService.sadd(`user:${payload.id}:refreshTokens`, refreshToken);
    return refreshToken;
  }

  async login(params: LoginDto) {
    const { password, email } = params;

    const user: Users = await this.userService.findByEmail(email);

    if (!user) {
      ErrorHelper.BadRequestException(USER_MESSAGE.WRONG_EMAIL);
    }

    if (!user.isVerified) {
      ErrorHelper.UnauthorizedException(USER_MESSAGE.INACTIVE_ACCOUNT);
    }

    const isPasswordValid = await EncryptHelper.compare(password, user.password);

    if (!isPasswordValid) {
      ErrorHelper.BadRequestException(USER_MESSAGE.WRONG_PASSWORD);
    }

    const role: string = user.isAdmin ? ERoles.ADMIN : ERoles.USER;

    return this.generateToken(
      {
        id: user.id,
        roles: role,
      },
      true,
    );
  }

  async createNewRefreshToken(refreshToken: string) {
    const payload: IToken = TokenHelper.verify(refreshToken, this.configService.get('REFRESH_TOKEN_SECRET'));
    // if ((await this.IsStoredRefreshtoken(refreshToken, payload.id)) !== 1) {
    //   ErrorHelper.UnauthorizedException('Invalid refresh token');
    // }
    // await this.redisService.srem(`user:${payload.id}:refreshTokens`, refreshToken);
    return this.generateRefreshToken({ id: payload.id, roles: payload.roles });
  }

  async register(createUserDto: CreateUserDto) {
    const token: string = await this.userService.registerUser(createUserDto);
    const URL: string = this.configService.get<string>('CONFIRM_REGISTER_URL');
    const link: string = `${URL}${token}`;
    const { email } = createUserDto;

    const body = await this.awsSesService.createTemplate({ email, link }, ETemplate.EMAIL_CONFIRM);
    return await this.awsSesService.sendEmail(createUserDto.email, ESubject.VERIFY_EMAIL, body);
  }

  async confirmRegister(token: string) {
    const secret: string = this.configService.get<string>('TOKEN_SECRET');
    const payload: IToken = TokenHelper.verify(token, secret);
    await this.cacheService.checkUsedToken(`user:${payload.id}:registerTokens`, token);
    return await this.userService.confirmRegister(payload);
  }

  async resetPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const token: string = await this.userService.forgotPassword(email);
    const URL: string = this.configService.get<string>('VERIFY_RESET_PASSWORD_URL');
    const link: string = `${URL}${token}`;
    const body = await this.awsSesService.createTemplate({ email, link }, ETemplate.EMAIL_RESET_PASSWORD);
    return await this.awsSesService.sendEmail(email, ESubject.RESET_PASSWORD, body);
  }

  async verifyResetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    const { password } = resetPasswordDto;
    const secret: string = this.configService.get<string>('TOKEN_SECRET');
    const payload: IToken = TokenHelper.verify(token, secret);
    return await this.userService.verifyForgotPassword(payload, password);
  }

  async verifyToken(token: string) {
    const secret: string = this.configService.get<string>('TOKEN_SECRET');
    const payload: IToken = await TokenHelper.verify(token, secret);
    await this.cacheService.checkUsedToken(`user:${payload.id}:resetPasswordTokens`, token);
    return true;
  }
}
