import { Module } from "@nestjs/common";

import { UsersModule } from "./modules/users/users.module";
import { DatabaseModule } from "./database/database.module";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/authenticate/auth.module";
import { TaskModule } from "./modules/task/task.module";

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    TaskModule,
  ],
})
export class AppModule {}
