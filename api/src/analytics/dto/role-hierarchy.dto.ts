import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleHierarchyItemDto {
  @ApiProperty({
    description: 'The role title',
  })
  title: string;

  @ApiProperty({
    description: 'The role code',
  })
  code: string;

  @ApiPropertyOptional({
    description: 'The role esco url',
    type: String,
  })
  escoUrl?: string;
}

export class RoleHierarchyDto {
  @ApiProperty({
    description: 'The role hierarchy',
    type: RoleHierarchyItemDto,
    isArray: true,
  })
  hierarchy: RoleHierarchyItemDto[];
}
