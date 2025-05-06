import { ApiProperty } from '@nestjs/swagger';

export class RoleListDto {
  @ApiProperty({
    description: 'The ESCO title of the role',
    type: String,
  })
  title: string;

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
  roleCount: number;
}

export class RoleListResponseDto {
  @ApiProperty({ type: [RoleListDto] })
  roles: RoleListDto[];

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
