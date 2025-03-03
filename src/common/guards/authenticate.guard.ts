import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ErrorHelper } from "src/helpers/error.utils";
import { TokenHelper } from "src/helpers/token.helper";
import { ConfigService } from "@nestjs/config";
import { IToken } from "src/interfaces/auth.interface";
import { UsersService } from "src/modules/users/users.service";
import * as USER_MESSAGE from "src/common/messages/user.message";
import { UNAUTHORIZED } from "../messages/common.message";

@Injectable()
export class AuthRoleGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authorization = req.headers.authorization || String(req.cookies.JWT);

    if (!authorization) {
      ErrorHelper.UnauthorizedException(UNAUTHORIZED);
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
    const [bearer, accessToken] = authorization.split(" ");
    if (bearer === "Bearer" && accessToken) {
      const payload: IToken = TokenHelper.verify(
        accessToken,
        this.configService.get("ACCESS_TOKEN_SECRET")
      );

      return payload;
    } else {
      ErrorHelper.UnauthorizedException(UNAUTHORIZED);
    }
  }
}
