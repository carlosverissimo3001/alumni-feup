import { IndustryOptionDto } from '@/analytics/dto';
import { IndustryRepository } from '@/analytics/repositories';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('V1')
@Controller('analytics/industries')
export class IndustryAnalyticsController {
  constructor(private readonly industryRepository: IndustryRepository) {}

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
