import { COMPANY_SIZE, COMPANY_TYPE } from '@/analytics/consts/enum';
import { LocationGeo } from '@/entities';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IndustryAnalyticsEntity as Industry } from '@/analytics/entities/industry.entity';
import { BasicAlumniDto } from './basic-alumni.dto';
import { BasicRoleDto } from './basic-role.dto';
import { BasicGeoDto } from './basic-geo.dto';
import { DataPointDto } from '../data-point.dto';

export class BasicCompanyDto {
  @ApiProperty({ description: 'The id of the company', type: String })
  id: string;

  @ApiProperty({ description: 'The name of the company', type: String })
  name: string;
}

export class BasicCityDto extends BasicGeoDto {
  @ApiProperty({ description: 'The id of the city', type: String })
  id: string;

  @ApiProperty({ description: 'The name of the city', type: String })
  city: string;
}

export class CompanyInsightsDto {
  @ApiProperty({ description: 'The id of the company', type: String })
  id: string;

  @ApiProperty({ description: 'The name of the company', type: String })
  name: string;

  @ApiPropertyOptional({ description: 'The logo of the company', type: String })
  logo?: string | null;

  @ApiPropertyOptional({
    description: 'The linkedin url of the company',
    type: String,
  })
  linkedinUrl?: string | null;

  @ApiPropertyOptional({
    description: 'The URL of the company on Levels.fyi',
    type: String,
  })
  levelsFyiUrl?: string | null;

  @ApiPropertyOptional({
    description: 'The headquarters of the company',
    type: LocationGeo,
  })
  headquarters?: LocationGeo | null;

  @ApiPropertyOptional({
    description: 'The size of the company',
    enum: COMPANY_SIZE,
    enumName: 'COMPANY_SIZE',
  })
  companySize?: COMPANY_SIZE;

  @ApiPropertyOptional({
    description: 'The type of the company',
    enum: COMPANY_TYPE,
    enumName: 'COMPANY_TYPE',
  })
  companyType?: COMPANY_TYPE;

  @ApiProperty({
    description: 'Was the company founded by an alumni',
    type: Boolean,
  })
  foundedByAlumni: boolean;

  @ApiPropertyOptional({
    description: 'The founded year of the company',
    type: String,
  })
  founded?: number | null;

  @ApiPropertyOptional({
    description: 'The website of the company',
    type: String,
  })
  website?: string | null;

  @ApiPropertyOptional({
    description: 'The industry of the company',
    type: Industry,
  })
  industry?: Industry | null;

  @ApiPropertyOptional({
    description:
      'The similar companies of the company, whether by industry, # of employees, etc.',
    type: BasicCompanyDto,
    isArray: true,
  })
  similarCompanies?: BasicCompanyDto[] | null;

  @ApiProperty({
    description: 'The average YOE of the current employees',
    type: Number,
  })
  averageYOE: number;

  @ApiProperty({
    description: 'The average length of employment in company',
    example: '2 years and 3 months',
    type: String,
  })
  averageYOC: string;

  @ApiProperty({
    description: 'The roles of the company',
    type: BasicRoleDto,
    isArray: true,
  })
  roles?: BasicRoleDto[] | null;

  @ApiProperty({
    description: 'The alumni of the company',
    type: BasicAlumniDto,
    isArray: true,
  })
  currentAlumni: BasicAlumniDto[];

  @ApiProperty({
    description: 'The past alumni of the company',
    type: BasicAlumniDto,
    isArray: true,
  })
  alumni: BasicAlumniDto[];

  @ApiProperty({
    description:
      'The countries where alumni that work for the company are located',
    type: BasicGeoDto,
    isArray: true,
  })
  countries: BasicGeoDto[];

  @ApiProperty({
    description:
      'The cities where alumni that work for the company are located',
    type: BasicGeoDto,
    isArray: true,
  })
  cities: BasicGeoDto[];

  @ApiProperty({
    description: 'The trend of the company',
    type: DataPointDto,
    isArray: true,
  })
  alumniTrend: DataPointDto[];

  @ApiProperty({
    description: 'The average trend of the company',
    type: DataPointDto,
    isArray: true,
  })
  averageTrend: DataPointDto[];

  @ApiProperty({
    description: 'The trend of companies in the same industry',
    type: DataPointDto,
    isArray: true,
  })
  industryTrend: DataPointDto[];

  @ApiProperty({
    description: 'The most common migration paths',
    type: String,
    isArray: true,
  })
  // TODO: Define how to represent this
  migrations: string[];
}
