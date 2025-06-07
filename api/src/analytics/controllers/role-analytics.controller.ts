import { RoleAnalyticsService } from '@/analytics/services';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetRoleHierarchyDto, RoleHierarchyDto } from '@/analytics/dto';
import { RoleAnalyticsEntity } from '../entities';
import { GetRoleDto } from '../dto/get-role.dto';

@ApiTags('V1')
@Controller('analytics/roles')
export class RoleAnalyticsController {
  constructor(private readonly roleAnalyticsService: RoleAnalyticsService) {}

  @Get('/hierarchy')
  @ApiOperation({
    summary: 'Gets the hierarchy of a role',
    description: 'Returns a list of roles with their ESCO code and title.',
  })
  @ApiResponse({
    status: 200,
    description: 'The hierarchy of a role',
    type: RoleHierarchyDto,
  })
  async getRoleHierarchy(@Query() query: GetRoleHierarchyDto) {
    return this.roleAnalyticsService.getRoleHierarchy(query);
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Returns the role with the given id',
  })
  @ApiResponse({
    status: 200,
    description: 'The role with the given id',
    type: RoleAnalyticsEntity,
  })
  async getRole(@Param('id') id: string, @Query() query: GetRoleDto) {
    return this.roleAnalyticsService.getRole(id, query);
  }
}
