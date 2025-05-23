import { SequelizeModule } from "@nestjs/sequelize";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import * as models from "../models";

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: "postgres",
        host: configService.get("POSTGRES_HOST"),
        port: configService.get("POSTGRES_PORT"),
        username: configService.get("POSTGRES_USERNAME"),
        password: configService.get("POSTGRES_PASSWORD"),
        database: configService.get("POSTGRES_DATABASE"),
        autoLoadModels: false,
        models: Object.values(models),
        logging: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
