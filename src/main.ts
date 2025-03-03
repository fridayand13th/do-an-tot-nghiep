import { NestFactory } from "@nestjs/core";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { useContainer } from "class-validator";
import morgan from "morgan";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ValidationPipe } from "./common/pipes/validation.pipe";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { SERVER_PORT } from "./environments";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Đặt tiền tố API trước khi thiết lập Swagger
  const globalPrefix = configService.get("API_PREFIX") || "api";
  app.setGlobalPrefix(globalPrefix);

  app.use(cors());
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  // Chỉ kích hoạt Swagger trong môi trường development
  if (configService.get("NODE_ENV") === "development") {
    const config = new DocumentBuilder()
      .setTitle("Friday API")
      .setDescription("API documentation for Friday")
      .setVersion("1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);

    // Sử dụng tiền tố API cho Swagger
    SwaggerModule.setup(`${globalPrefix}`, app, document);
  }

  // Global Nest setup
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Bật shutdown hooks
  app.enableShutdownHooks();

  await app.listen(SERVER_PORT);
}

bootstrap();
