import { Controller, Get, Param } from '@nestjs/common';
import { CompanyAnalyticsService } from '../services';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { CompanyOptionDto, CompanyInsightsDto } from '../dto';

@ApiTags('V1')
@Controller('analytics/companies')
export class CompanyAnalyticsController {
  constructor(
    private readonly companyAnalyticsService: CompanyAnalyticsService,
  ) {}

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
}
