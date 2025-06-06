import { Controller, Get, Param, Query } from '@nestjs/common';
import { CompanyAnalyticsService } from '../services';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import {
  QueryParamsDto,
  CompanyOptionDto,
  CompanyListResponseDto,
  CompanyInsightsDto,
} from '../dto';

@ApiTags('V1')
@Controller('analytics/companies')
export class CompanyAnalyticsController {
  constructor(
    private readonly companyAnalyticsService: CompanyAnalyticsService,
  ) {}

  /* @Get('/')
  @ApiOperation({
    summary: 'Get the companies, and the number of alumni working in them.',
  })
  @ApiResponse({
    status: 200,
    description: 'Companies with the number of alumni working in them.',
    type: CompanyListResponseDto,
  })
  async getCompaniesWithAlumniCount(@Query() query: QueryParamsDto) {
    return this.companyAnalyticsService.getCompaniesWithAlumniCount(query);
  } */

  @Get('/options')
  @ApiOperation({
    summary: 'List of possible companies to search for.',
  })
  @ApiResponse({
    status: 200,
    description: 'Companies id and name.',
    type: CompanyOptionDto,
    isArray: true,
  })
  async getCompanyOptions() {
    return this.companyAnalyticsService.getCompanyOptions();
  }

  @Get('/growth')
  @ApiOperation({
    summary: 'Returns company employment growth over time.',
  })
  async getCompanyGrowth() {
    // TODO: Implement this
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Returns detailed information about a specific company.',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed information about a specific company.',
    type: CompanyInsightsDto,
  })
  async getCompanyDetails(@Param('id') id: string) {
    return this.companyAnalyticsService.getCompanyInsights(id);
  }

  /* @Get('/hot-companies')
  @ApiOperation({
    summary: 'Returns companies that have seen a spike in alumni employment.',
  })
  async getHotCompanies(@Query() query: QueryParamsDto) {
    // TODO: Implement this
  } */
}
