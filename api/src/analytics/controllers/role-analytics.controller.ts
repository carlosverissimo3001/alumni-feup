import { RoleAnalyticsService } from '@/analytics/services';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  QueryParamsDto,
  RoleListResponseDto,
  RoleOptionDto,
  GetRoleHierarchyDto,
} from '@/analytics/dto';

@ApiTags('V1')
@Controller('analytics/roles')
export class RoleAnalyticsController {
  constructor(private readonly roleAnalyticsService: RoleAnalyticsService) {}

  @Get('/')
  @ApiOperation({
    summary:
      'Returns the number of roles classified with each ESCO classification',
  })
  @ApiResponse({
    status: 200,
    description:
      'The number of roles classified with each ESCO classification, and the level of classification of the role',
    type: RoleListResponseDto,
  })
  async getRoles(@Query() query: QueryParamsDto) {
    return this.roleAnalyticsService.getRolesWithCounts(query);
  }

  @Get('/options')
  @ApiOperation({
    summary: 'List of possible role titles to search for.',
    description: 'Returns a list of roles with their ESCO code and title.',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles with their ESCO code and title.',
    type: RoleOptionDto,
    isArray: true,
  })
  async getRoleOptions() {
    return this.roleAnalyticsService.findAllClassifications();
  }

  @Get('/hierarchy')
  @ApiOperation({
    summary: 'Gets the hierarchy of a role',
    description: 'Returns a list of roles with their ESCO code and title.',
  })
  @ApiResponse({
    status: 200,
    description: 'The hierarchy of a role',
    type: String,
  })
  async getRoleHierarchy(@Query() query: GetRoleHierarchyDto) {
    return this.roleAnalyticsService.getRoleHierarchy(query);
  }
}
