import { plainToClass } from 'class-transformer';
import { IsEmail, IsNumber, IsString, Matches, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  SERVER_PORT: number;

  @IsNumber()
  POSTGRES_PORT: number;

  @IsString()
  POSTGRES_USERNAME: string;

  @IsString()
  POSTGRES_PASSWORD: string;

  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @IsString()
  @Matches(/^(\d+)([SMHDY])$/)
  ACCESS_TOKEN_EXPIRES_IN: string;

  @IsString()
  NODE_ENV: string;

  @IsString()
  WEBHOOK_URL: string;

  @IsNumber()
  WEBHOOK_WEIGHT: number;

  @IsString()
  WEBHOOK_API_KEY: string;

  @IsString()
  DATABASE: string;

  @IsNumber()
  API_KEY_LIMIT: number;

  @IsString()
  @Matches(/^(\d+)([MDY])$/)
  DURATION: string;

  @IsString()
  AWS_S3_BUCKET_NAME: string;

  @IsString()
  AWS_REGION: string;

  @IsString()
  AWS_ACCESS_KEY_ID: string;

  @IsString()
  AWS_SECRET_ACCESS_KEY: string;

  @IsString()
  REFRESH_TOKEN_SECRET: string;

  @IsString()
  @Matches(/^(\d+)([SMHDY])$/)
  REFRESH_TOKEN_EXPIRES_IN: string;

  @IsString()
  TOKEN_SECRET: string;

  @IsString()
  @Matches(/^(\d+)([SMHDY])$/)
  TOKEN_EXPIRES_IN: string;

  @IsEmail()
  SES_EMAIL_ADDRESS: string;

  @IsString()
  CONFIRM_REGISTER_URL: string;

  @IsString()
  VERIFY_RESET_PASSWORD_URL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
