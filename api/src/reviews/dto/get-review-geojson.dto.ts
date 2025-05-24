import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { GROUP_BY } from '@/consts';

export class GetReviewGeoJSONDto {
  @ApiProperty({
    description: 'How to group the data',
    example: GROUP_BY.COUNTRIES,
    enum: GROUP_BY,
  })
  @IsEnum(GROUP_BY)
  groupBy: GROUP_BY;

  @ApiPropertyOptional({
    description: 'Type of review',
    example: 'Company',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? String(value) : undefined))
  reviewType?: string;

  @ApiPropertyOptional({ description: 'The review rating' })
  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => (value ? Number(value) : undefined))
  rating?: number;

  @ApiPropertyOptional({ description: 'Date range to filter' })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  dateFrom?: Date;

  @ApiPropertyOptional({ description: 'Date range to filter' })
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  dateTo?: Date;

  // @ApiPropertyOptional({
  //   description: 'Sort by most voted, least voted',
  //   example: 'most',
  // })
  // @IsString()
  // sortBy?: string;
}
