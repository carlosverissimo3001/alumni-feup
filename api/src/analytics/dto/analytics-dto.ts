import { ApiPropertyOptional } from '@nestjs/swagger';
import { AlumniListResponseDto } from './alumni-list.dto';
import { CompanyListResponseDto } from './company-list.dto';
import { CountryListResponseDto } from './country-list.dto';
import { CityListResponseDto } from './city-list.dto';

export class AnalyticsDto {
  @ApiPropertyOptional({
    description: 'The alumni analytics data',
    type: AlumniListResponseDto,
  })
  alumniData?: AlumniListResponseDto;

  @ApiPropertyOptional({
    description: 'The company analytics data',
    type: CompanyListResponseDto,
  })
  companyData?: CompanyListResponseDto;

  @ApiPropertyOptional({
    description: 'The country analytics data',
    type: CountryListResponseDto,
  })
  countryData?: CountryListResponseDto;

  @ApiPropertyOptional({
    description: 'The city analytics data',
    type: CityListResponseDto,
  })
  cityData?: CityListResponseDto;

  // TODO: Add all the other analytics data
}
