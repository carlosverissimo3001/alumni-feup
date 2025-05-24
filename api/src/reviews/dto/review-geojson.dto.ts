import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
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
