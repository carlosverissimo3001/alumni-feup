/* Defines what non-authenticated users see on someone else's profile */

import { Location } from '@/entities';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompanyDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  industry: string;

  @ApiPropertyOptional({
    type: String,
  })
  website?: string | null;

  @ApiPropertyOptional({
    type: String,
  })
  linkedinUrl?: string | null;

  @ApiPropertyOptional({
    type: String,
  })
  logo?: string | null;
}

export class ExtendedCompanyDto extends CompanyDto {
  @ApiPropertyOptional({
    description: 'The current location of the alumni',
    type: Location,
  })
  location?: Location | null;
}

export class AlumniPastLocationsAndCompaniesDto {
  @ApiPropertyOptional({
    description: 'The Company of the review',
    type: ExtendedCompanyDto,
    isArray: true,
  })
  Companies?: ExtendedCompanyDto[];

  @ApiPropertyOptional({
    description: 'The Location of the review',
    type: Location,
    isArray: true,
  })
  Locations?: Location[];
}
