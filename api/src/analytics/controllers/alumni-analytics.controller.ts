import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AlumniAnalyticsService } from '../services';
import { AlumniListResponseDto, AlumniOptionDto, QueryParamsDto } from '../dto';

@ApiTags('V1')
@Controller('analytics/alumni')
export class AlumniAnalyticsController {
  constructor(
    private readonly alumniAnalyticsService: AlumniAnalyticsService,
  ) {}

  /* @Get('/')
  @ApiOperation({ summary: 'Get all alumni list' })
  @ApiResponse({
    status: 200,
    description: 'Alumni list',
    type: AlumniListResponseDto,
  })
  async getAlumniList(@Query() query: QueryParamsDto) {
    return this.alumniAnalyticsService.getAlumniList(query);
  } */

  @Get('/options')
  @ApiOperation({ summary: 'Get all alumni options' })
  @ApiResponse({ type: AlumniOptionDto, isArray: true })
  async getAlumniOptions() {
    return this.alumniAnalyticsService.getAlumniOptions();
  }
}
