import { Controller, Get, Query } from '@nestjs/common';
import { GeoAnalyticsService } from '@/analytics/services';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { CountryOptionDto, CityOptionDto, GetCitiesDto } from '@/analytics/dto';

@ApiTags('V1')
@Controller('analytics/geo')
export class GeoAnalyticsController {
  constructor(private readonly geoAnalyticsService: GeoAnalyticsService) {}

  @Get('/country-options')
  @ApiOperation({
    summary: 'Get the countries options.',
  })
  @ApiResponse({
    status: 200,
    description: 'The countries options.',
    type: CountryOptionDto,
    isArray: true,
  })
  async getCountriesOptions() {
    return this.geoAnalyticsService.getCountriesOptions();
  }

  @Get('/city-options')
  @ApiOperation({
    summary: 'Get the cities options.',
  })
  @ApiResponse({
    status: 200,
    description: 'The cities options.',
    type: CityOptionDto,
    isArray: true,
  })
  async getCitiesOptions(@Query() query: GetCitiesDto) {
    return this.geoAnalyticsService.getCityOptions(query);
  }
}
