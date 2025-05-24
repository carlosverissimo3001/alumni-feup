import { Controller, Get, Query } from '@nestjs/common';
import { GeoAnalyticsService } from '@/analytics/services';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import {
  QueryParamsDto,
  CountryListResponseDto,
  CountryOptionDto,
  CityOptionDto,
  GetCitiesDto,
  CityListResponseDto,
} from '@/analytics/dto';

@ApiTags('V1')
@Controller('analytics/geo')
export class GeoAnalyticsController {
  constructor(private readonly geoAnalyticsService: GeoAnalyticsService) {}

  @Get('/countries')
  @ApiOperation({
    summary: 'Get the countries, and the number of alumni working in them.',
  })
  @ApiResponse({
    status: 200,
    description: 'The countries with the number of alumni working in them.',
    type: CountryListResponseDto,
  })
  async getCountriesWithAlumniCount(@Query() query: QueryParamsDto) {
    return this.geoAnalyticsService.getCountriesWithAlumniCount(query);
  }

  @Get('/cities')
  @ApiOperation({
    summary: 'Get the cities, and the number of alumni working in them.',
  })
  @ApiResponse({
    status: 200,
    description: 'The countries with the number of alumni working in them.',
    type: CityListResponseDto,
  })
  async getCitiesWithAlumniCount(@Query() query: QueryParamsDto) {
    return this.geoAnalyticsService.getCitiesWithAlumniCount(query);
  }

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
