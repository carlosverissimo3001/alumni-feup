import { ApiProperty } from '@nestjs/swagger';
import { DataPointDto } from './data-point.dto';
export class IndustryListItemDto {
  @ApiProperty({
    description: 'The ID of the industry',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the industry',
    example: 'Financial Services',
  })
  name: string;

  @ApiProperty({
    description: 'The number of alumni working in the industry',
    example: 100,
  })
  count: number;

  @ApiProperty({
    description: 'The alumni trend of the industry',
    type: [DataPointDto],
  })
  trend: DataPointDto[];
}

export class IndustryListResponseDto {
  @ApiProperty({ type: [IndustryListItemDto] })
  industries: IndustryListItemDto[];

  @ApiProperty({
    description: 'The total number of industries in the database',
  })
  count: number;
}
