import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginateDto } from 'src/common/dto/common.dto';

export class GetUserDto extends PaginateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  email: string;
}
