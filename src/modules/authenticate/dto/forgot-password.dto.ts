import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { IsMatchPattern } from 'src/common/validators/IsMatchPattern.validation';
import { PASSWORD_PATTERN } from 'src/constants/base.constant';

export class ForgotPasswordDto {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @ApiProperty()
  @IsMatchPattern(PASSWORD_PATTERN)
  password: string;
}
