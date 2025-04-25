import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsArray, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { GROUP_BY } from '@/consts';

export class ReviewGeoJSONDto {
  @ApiProperty({
    description: 'How to group the data',
    example: GROUP_BY.COUNTRIES,
    enum: GROUP_BY,
  })
  @IsEnum(GROUP_BY)
  groupBy: GROUP_BY;

//   @ApiProperty({
//     description: 'Type of Review',
//     example: REVIEW_TYPE.COUNTRIES,
//     enum: REVIEW_TYPE,
//   })
//   @IsEnum(REVIEW_TYPE)
//   reviewType: REVIEW_TYPE;
}
