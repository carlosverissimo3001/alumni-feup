import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsArray, IsOptional, IsUUID, IsEnum } from 'class-validator';
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
    description: 'The review type',
    example: '',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? String(value) : undefined))
  reviewType?: string;
}
