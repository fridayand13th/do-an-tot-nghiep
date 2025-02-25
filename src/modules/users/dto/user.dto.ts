import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsBooleanString, IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsMatchPattern } from 'src/common/validators/IsMatchPattern.validation';
import { PASSWORD_PATTERN } from 'src/constants/base.constant';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255, { message: 'content is too long' })
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'content is too long' })
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'content is too long' })
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsMatchPattern(PASSWORD_PATTERN)
  @IsNotEmpty()
  @MaxLength(255, { message: 'content is too long' })
  password: string;
}

export class UpdateUserDto {
  @MaxLength(255, { message: 'content is too long' })
  @ApiProperty({ required: false })
  @IsString()
  firstName: string;

  @MaxLength(255, { message: 'content is too long' })
  @ApiProperty({ required: false })
  @IsString()
  lastName: string;

  @MaxLength(255, { message: 'content is too long' })
  @ApiProperty({ required: false })
  @IsString()
  contactNumber: string;

  @MaxLength(255, { message: 'content is too long' })
  @ApiProperty({ required: false })
  @IsString()
  address: string;

  @MaxLength(255, { message: 'content is too long' })
  @ApiProperty({ required: false })
  @IsString()
  zipCode: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  file?: Express.Multer.File;

  @ApiProperty({ required: true })
  @IsBooleanString()
  isDeleteAvatar?: string;
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
  @MaxLength(255, { message: 'content is too long' })
  newPassword: string;
}

export class UpdateUserStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;
}
