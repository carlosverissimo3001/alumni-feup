import { Controller, Get, Query } from '@nestjs/common';
import { CountryAnalyticsService } from '../services/country-analytics.service';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { QueryParamsDto } from '../dto/query-params.dto';
import { CountryListResponseDto } from '../dto/country-list.dto';
import { CountryOptionDto } from '../dto/country-option.dto';
import { CityOptionDto } from '../dto/city-option.dto';
import { GetCitiesDto } from '../dto/get-cities.dto';

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
