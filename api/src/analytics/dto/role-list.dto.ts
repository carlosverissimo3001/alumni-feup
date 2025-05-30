import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DataPointDto } from './data-point.dto';
export class RoleListItemDto {
  @ApiProperty({
    description: 'The name of the role',
    type: String,
  })
  name: string;

  @ApiProperty({
    description:
      'The level of classification of the role, 1-4 being ISCO-08 and 5+ being ESCO',
    type: Number,
  })
  level: number;

  @ApiPropertyOptional({
    description: 'The URL of the role in the ESCO classification tree',
    type: String,
  })
  escoUrl?: string;

  @ApiProperty({
    description: 'The ESCO code of the role',
    type: String,
  })
  code: string;

  @ApiProperty({
    description: 'The number of roles classified with this role',
    type: Number,
  })
  count: number;

  @ApiProperty({
    description: 'The trend of the role',
    type: [DataPointDto],
  })
  trend: DataPointDto[];
}

export class RoleListResponseDto {
  @ApiProperty({ type: [RoleListItemDto] })
  roles: RoleListItemDto[];

  @ApiProperty({
    description: 'The total number of roles in the database',
    type: Number,
  })
  count: number;

  @ApiProperty({
    description: 'The total number of distinct roles in the database',
    type: Number,
  })
  distinctCount: number;
}
