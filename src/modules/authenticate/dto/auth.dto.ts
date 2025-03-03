import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";
import { IsMatchPattern } from "src/common/validators/IsMatchPattern.validation";
import { PASSWORD_PATTERN } from "src/constants/base.constant";

export class LoginDto {
  @IsString()
  @IsEmail()
  @ApiProperty({
    required: true,
    description: "Email",
    example: "nguyentienmanh003@gmail.com",
  })
  email: string;

  @IsString()
  @ApiProperty({
    required: true,
    description: "Password",
    example: "Manh@1234",
  })
  @IsMatchPattern(PASSWORD_PATTERN)
  password: string;
}
