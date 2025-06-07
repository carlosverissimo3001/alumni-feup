import { Controller, Get, Param } from '@nestjs/common';
import { CompanyAnalyticsService } from '../services';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { CompanyInsightsDto } from '../dto';

@ApiTags('V1')
@Controller('analytics/companies')
export class CompanyAnalyticsController {
  constructor(
    private readonly companyAnalyticsService: CompanyAnalyticsService,
  ) {}

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
