import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsDto, QueryParamsDto } from '../dto';
import { AnalyticsService } from '../services';

@ApiTags('V1')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('/')
  @ApiOperation({
    summary: 'Gather all the data needed for the analytics page',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics data',
    type: AnalyticsDto,
  })
  async getAnalytics(@Query() query: QueryParamsDto) {
    return this.analyticsService.getAnalytics(query);
  }
}
