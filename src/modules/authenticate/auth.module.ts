import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { AwsSesModule } from "../aws-ses/aws-ses.module";
import { CacheModule } from "src/shared/cache/cache.module";

@Module({
  imports: [UsersModule, AwsSesModule, CacheModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
