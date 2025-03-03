import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { INVALID_USER_NAME } from "src/common/messages/common.message";
import { INVALID_EMAIL } from "src/common/messages/user.message";
import { IsMatchPattern } from "src/common/validators/IsMatchPattern.validation";
import { PASSWORD_PATTERN } from "src/constants/base.constant";

export class CreateUserDto {
  @ApiProperty({
    required: true,
    description: "Email",
    example: "nguyentienmanh003@gmail.com",
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255, { message: INVALID_EMAIL })
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: INVALID_USER_NAME })
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: INVALID_USER_NAME })
  lastName: string;

  @ApiProperty({
    required: true,
    description: "Password",
    example: "Manh@1234",
  })
  @IsString()
  @IsMatchPattern(PASSWORD_PATTERN)
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto {
  @MaxLength(255, { message: INVALID_USER_NAME })
  @ApiProperty({ required: false })
  @IsString()
  firstName: string;

  @MaxLength(255, { message: INVALID_USER_NAME })
  @ApiProperty({ required: false })
  @IsString()
  lastName: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @IsMatchPattern(PASSWORD_PATTERN)
  @IsNotEmpty()
  newPassword: string;
}
