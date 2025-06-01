import {
  RoleAnalyticsService,
  SeniorityAnalyticsService,
} from '@/analytics/services';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  QueryParamsDto,
  RoleListResponseDto,
  RoleOptionDto,
  GetRoleHierarchyDto,
  RoleHierarchyDto,
  SeniorityListResponseDto,
} from '@/analytics/dto';
import { RoleAnalyticsEntity } from '../entities';

@ApiTags('V1')
@Controller('analytics/roles')
export class RoleAnalyticsController {
  constructor(
    private readonly roleAnalyticsService: RoleAnalyticsService,
    private readonly seniorityAnalyticsService: SeniorityAnalyticsService,
  ) {}

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
    type: RoleHierarchyDto,
  })
  async getRoleHierarchy(@Query() query: GetRoleHierarchyDto) {
    return this.roleAnalyticsService.getRoleHierarchy(query);
  }

  @Get('/seniority')
  @ApiOperation({
    summary: 'Returns the number of roles classified with each seniority level',
  })
  @ApiResponse({
    status: 200,
    description: 'The number of roles classified with each seniority level',
    type: SeniorityListResponseDto,
  })
  async getSeniorityLevels(@Query() query: QueryParamsDto) {
    return this.seniorityAnalyticsService.getSeniorityLevels(query);
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
  async getRole(@Param('id') id: string) {
    return this.roleAnalyticsService.getRole(id);
  }
}
