import { Controller, Get, Query } from '@nestjs/common';
import { CountryAnalyticsService } from '../services/country-analytics.service';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import {
  QueryParamsDto,
  CountryListResponseDto,
  CountryOptionDto,
  CityOptionDto,
  GetCitiesDto,
  CityListResponseDto,
} from '@/analytics/dto';

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
    return this.countryAnalyticsService.getCitiesWithAlumniCount(query);
  }

  @Get('/options')
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
    return this.countryAnalyticsService.getCountriesOptions();
  }

  @Get('/cities/options')
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
    return this.countryAnalyticsService.getCityOptions(query);
  }
}
