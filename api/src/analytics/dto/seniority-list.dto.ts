import { ApiProperty } from '@nestjs/swagger';
import { SENIORITY_LEVEL } from '@prisma/client';
import { DataPointDto } from './data-point.dto';

export class SeniorityListItemDto {
  @ApiProperty({
    description: 'The name of the seniority level',
    enum: SENIORITY_LEVEL,
  })
  name: SENIORITY_LEVEL;

  @ApiProperty({
    description: 'The number of roles with this seniority level',
    type: Number,
  })
  count: number;

  @ApiProperty({
    description: 'The trend of the seniority level',
    type: DataPointDto,
    isArray: true,
  })
  trend: DataPointDto[];
}

export class SeniorityListResponseDto {
  @ApiProperty({ type: [SeniorityListItemDto] })
  seniorityLevels: SeniorityListItemDto[];

  @ApiProperty({
    description:
      'The total number of seniority levels in the database after applying the filters',
  })
  count: number;
}
