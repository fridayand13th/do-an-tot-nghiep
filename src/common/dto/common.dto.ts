import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';

export class PaginateDto {
  @IsOptional()
  @ApiProperty({ required: false, default: 1 })
  page: number = 1;

  @IsOptional()
  @ApiProperty({ required: false, default: 10 })
  take: number = 10;
}

export class DateFilterDto extends PaginateDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({ required: false })
  startDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({ required: false })
  endDate: Date;
}

export class TimeFilterDto {
  @IsNotEmpty()
  @IsInt()
  @Max(9999, { message: '연도는 1만 미만이어야 합니다.' })
  @Min(0, { message: '연도는 0년보다 커야 한다.' })
  @Transform(({ value }) => Number(value))
  @ApiProperty({ required: true, default: new Date().getFullYear() })
  year: number;

  @IsOptional()
  @IsInt()
  @Max(12, { message: '월은 12보다 작거나 같아야 합니다.' })
  @Min(1, { message: '날짜는 0보다 커야 합니다.' })
  @Transform(({ value }) => Number(value))
  @ApiProperty({ required: false })
  month: number;

  @IsOptional()
  @IsInt()
  @Max(31, { message: '날짜는 31보다 작거나 같아야 합니다.' })
  @Min(1, { message: '날짜는 0보다 커야 합니다.' })
  @Transform(({ value }) => Number(value))
  @ApiProperty({ required: false })
  day: number;
}
