import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import {
  INVALID_HOBBY,
  INVALID_USER_NAME,
} from "src/common/messages/common.message";
import { INVALID_EMAIL } from "src/common/messages/user.message";
import { IsMatchPattern } from "src/common/validators/IsMatchPattern.validation";
import { PASSWORD_PATTERN } from "src/constants/base.constant";
import { UserHobby } from "src/enums/user.enum";

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

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: INVALID_USER_NAME,
  })
  @MaxLength(255, { message: INVALID_USER_NAME })
  firstName: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: INVALID_USER_NAME,
  })
  @MaxLength(255, { message: INVALID_USER_NAME })
  lastName: string;

  @ApiProperty({ required: true, enum: UserHobby })
  @IsNotEmpty()
  @IsEnum(UserHobby)
  @MaxLength(255, { message: INVALID_HOBBY })
  hobby: UserHobby;

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
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: INVALID_USER_NAME,
  })
  @ApiProperty({ required: true })
  @IsString()
  firstName: string;

  @MaxLength(255, { message: INVALID_USER_NAME })
  @ApiProperty({ required: true })
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: INVALID_USER_NAME,
  })
  @IsString()
  lastName: string;

  @ApiProperty({ required: true, enum: UserHobby })
  @IsNotEmpty()
  @IsEnum(UserHobby)
  @MaxLength(255, { message: INVALID_HOBBY })
  hobby: UserHobby;
}

export class ChangePasswordDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsMatchPattern(PASSWORD_PATTERN)
  @IsNotEmpty()
  newPassword: string;
}
