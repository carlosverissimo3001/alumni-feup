import { ApiPropertyOptional } from '@nestjs/swagger';
import { AlumniListResponseDto } from './alumni-list.dto';
import { CityListResponseDto } from './city-list.dto';
import { CompanyListResponseDto } from './company-list.dto';
import { CountryListResponseDto } from './country-list.dto';
import { RoleListResponseDto } from './role-list.dto';
import { SeniorityListResponseDto } from './seniority-list.dto';
import { IndustryListResponseDto } from './industry-list.dto';
import {
  FacultyListDto,
  GraduationListDto,
  MajorListDto,
} from './education-list.dto';

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

  @ApiPropertyOptional({
    description: 'The role analytics data',
    type: RoleListResponseDto,
  })
  roleData?: RoleListResponseDto;

  @ApiPropertyOptional({
    description: 'The seniority analytics data',
    type: SeniorityListResponseDto,
  })
  seniorityData?: SeniorityListResponseDto;

  @ApiPropertyOptional({
    description: 'The industry analytics data',
    type: IndustryListResponseDto,
  })
  industryData?: IndustryListResponseDto;

  @ApiPropertyOptional({
    description: 'The faculty analytics data',
    type: FacultyListDto,
  })
  facultyData?: FacultyListDto;

  @ApiPropertyOptional({
    description: 'The major analytics data',
    type: MajorListDto,
  })
  majorData?: MajorListDto;

  @ApiPropertyOptional({
    description: 'The graduation analytics data',
    type: GraduationListDto,
  })
  graduationData?: GraduationListDto;

  // TODO: Add all the other analytics data
}
