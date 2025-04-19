import { Controller, Get, Query } from '@nestjs/common';
import { CountryAnalyticsService } from '../services/country-analytics.service';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { QueryParamsDto } from '../dto/query-params.dto';
import { CountryListResponseDto } from '../dto/country-list.dto';

@ApiTags('V1', 'Analytics')
@Controller('analytics/countries')
export class CountriesAnalyticsController {
  constructor(
    private readonly countryAnalyticsService: CountryAnalyticsService,
  ) {}

  @Get('/')
  @ApiOperation({
    summary: 'Get the countries, and the number of alumni working in them.',
  })
  @ApiResponse({
    status: 200,
    description: 'The countries with the number of alumni working in them.',
    type: CountryListResponseDto,
  })
  async getCountriesWithAlumniCount(@Query() query: QueryParamsDto) {
    return this.countryAnalyticsService.getCountriesWithAlumniCount(query);
  }
}
