import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ErrorHelper } from 'src/helpers/error.utils';
import { TokenHelper } from 'src/helpers/token.helper';
import { ConfigService } from '@nestjs/config';
import { IToken } from 'src/interfaces/auth.interface';
import { UsersService } from 'src/modules/users/users.service';
import * as USER_MESSAGE from 'src/common/messages/user.message';

@Injectable()
export class AuthRoleGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService, 
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authorization = req.headers.authorization || String(req.cookies.JWT);

    if (!authorization) {
      ErrorHelper.UnauthorizedException('Unauthorized');
    }

    const user = await this.verifyAccessToken(authorization);
    req.user = user;
    const userfound = await this.usersService.findById(user.id);

    if (!userfound) {
      ErrorHelper.ForbiddenException(USER_MESSAGE.NOT_FOUND);
    }


    return true;
  }

  async verifyAccessToken(authorization: string) {
    const [bearer, accessToken] = authorization.split(' ');
    if (bearer === 'Bearer' && accessToken) {
      const payload: IToken = TokenHelper.verify(accessToken, this.configService.get('ACCESS_TOKEN_SECRET'));

      // const isMember = await this.redisService.sismember(`user:${payload.id}:accessTokens`, accessToken);

      // if (isMember !== 1) {
      //   ErrorHelper.UnauthorizedException('Invalid access token');
      // }

      return payload;
    } else {
      ErrorHelper.UnauthorizedException('Unauthorized');
    }
  }

}
