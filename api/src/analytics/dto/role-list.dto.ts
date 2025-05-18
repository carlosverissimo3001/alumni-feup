import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty({
    description: 'Whether the role is a leaf node in the classification tree',
    type: Boolean,
  })
  isLeaf: boolean;

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
    description:
      'The total number of roles in the database after applying the filters',
    type: Number,
  })
  filteredCount: number;

  @ApiProperty({
    description:
      'The total number of distinct roles in the database after applying the filters',
    type: Number,
  })
  distinctCount: number;
}
