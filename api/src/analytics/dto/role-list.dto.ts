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
      'The level of classification of the role, 1 being a more general role and 2 being a more specific role',
    type: Number,
  })
  level: number;

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
}
