import { ApiPropertyOptional } from '@nestjs/swagger';
import { AlumniOptionDto } from './alumni-option.dto';
import { CompanyOptionDto } from './company-option.dto';
import { CountryOptionDto } from './country-option.dto';
import { IndustryOptionDto } from './industry.option.dto';
import { RoleOptionDto } from './role-option.dto';
import { CityOptionDto } from './city-option.dto';
import { CourseAnalyticsEntity as CourseEntity } from '@/analytics/entities';
import { FacultyAnalyticsEntity as FacultyEntity } from '@/analytics/entities';

export class AnalyticsOptionsDto {
  @ApiPropertyOptional({
    description: 'The options for countries',
    type: CountryOptionDto,
    isArray: true,
  })
  countries?: CountryOptionDto[];

  @ApiPropertyOptional({
    description: 'The options for cities',
    type: CityOptionDto,
    isArray: true,
  })
  cities?: CityOptionDto[];

  @ApiPropertyOptional({
    description: 'The options for industries',
    type: IndustryOptionDto,
    isArray: true,
  })
  industries?: IndustryOptionDto[];

  @ApiPropertyOptional({
    description: 'The options for roles',
    type: RoleOptionDto,
    isArray: true,
  })
  roles?: RoleOptionDto[];

  @ApiPropertyOptional({
    description: 'The options for companies',
    type: CompanyOptionDto,
    isArray: true,
  })
  companies?: CompanyOptionDto[];

  @ApiPropertyOptional({
    description: 'The options for alumni',
    type: AlumniOptionDto,
    isArray: true,
  })
  alumni?: AlumniOptionDto[];

  @ApiPropertyOptional({
    description: 'The options for courses',
    type: CourseEntity,
    isArray: true,
  })
  courses?: CourseEntity[];

  @ApiPropertyOptional({
    description: 'The options for faculties',
    type: FacultyEntity,
    isArray: true,
  })
  faculties?: FacultyEntity[];
}
