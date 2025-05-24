import {
  IndustryListResponseDto,
  IndustryOptionDto,
  QueryParamsDto,
} from '@/analytics/dto';
import { IndustryRepository } from '@/analytics/repositories';
import { CompanyAnalyticsService } from '@/analytics/services';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('V1')
@Controller('analytics/industries')
export class IndustryAnalyticsController {
  constructor(
    private readonly companyAnalyticsService: CompanyAnalyticsService,
    private readonly industryRepository: IndustryRepository,
  ) {}

  @Get('/')
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

  @Get('/options')
  @ApiOperation({
    summary: 'List of possible industries to search for.',
    description: 'Returns a list of industries with their id and name.',
  })
  @ApiResponse({
    status: 200,
    description: 'Industries with their id and name.',
    type: IndustryOptionDto,
    isArray: true,
  })
  async getIndustryOptions() {
    const industries = await this.industryRepository.findAll();

    return industries.map((industry) => ({
      id: industry.id,
      name: industry.name,
    }));
  }
}
