import { Controller, Get, Param, Query } from '@nestjs/common';
import { CompanyAnalyticsService } from '../services/company-analytics.service';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { QueryParamsDto } from '../dto/query-params.dto';
import { CompanyListResponseDto } from '../dto/company-list.dto';
import { IndustryListResponseDto } from '../dto/industry-list.dto';

@ApiTags('V1', 'Analytics')
@Controller('analytics/companies')
export class CompaniesAnalyticsController {
  constructor(
    private readonly companyAnalyticsService: CompanyAnalyticsService,
  ) {}

  @Get('/')
  @ApiOperation({
    summary: 'Get the companies, and the number of alumni working in them.',
  })
  @ApiResponse({
    status: 200,
    description: 'The companies with the number of alumni working in them.',
    type: CompanyListResponseDto,
  })
  async getCompaniesWithAlumniCount(@Query() query: QueryParamsDto) {
    return this.companyAnalyticsService.getCompaniesWithAlumniCount(query);
  }

  @Get('/by-industry')
  @ApiOperation({
    summary:
      'Returns the number of alumni working in companies grouped by industry.',
  })
  @ApiResponse({
    status: 200,
    description:
      'The industries with the number of alumni working in them, and the number of companies in each industry.',
    type: IndustryListResponseDto,
  })
  async getIndustryWithCounts(@Query() query: QueryParamsDto) {
    return this.companyAnalyticsService.getIndustryWithCounts(query);
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
  async getCompanyDetails(
    @Param('id') id: string,
    @Query() query: QueryParamsDto,
  ) {
    // TODO: Implement this
  }
}
