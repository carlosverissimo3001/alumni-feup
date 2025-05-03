/* Defines what non-authenticated users see on someone else's profile */

import { LocationGeo } from '@/entities';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SENIORITY_LEVEL } from '@prisma/client';

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
    type: LocationGeo,
  })
  location?: LocationGeo | null;
}

export class GraduationDto {
  @ApiProperty()
  conclusionYear: number;

  @ApiProperty()
  acronym: string;

  @ApiProperty()
  facultyAcronym: string;
}

export class CurrentRoleDto {
  @ApiProperty()
  title: string;

  @ApiPropertyOptional({
    type: String,
  })
  escoTitle?: string | null;

  @ApiPropertyOptional({
    type: String,
  })
  escoCode?: string | null;

  @ApiPropertyOptional({
    enum: SENIORITY_LEVEL,
  })
  seniorityLevel?: SENIORITY_LEVEL | null;

  @ApiPropertyOptional({
    type: Date,
  })
  startDate?: Date | null;

  @ApiPropertyOptional({
    type: Date,
  })
  endDate?: Date | null;
}

export class ReviewCompanyDto {


}

export class ReviewLocationDto {

}

export class BasicAlumniProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({
    type: String,
  })
  profilePictureUrl?: string | null;

  @ApiPropertyOptional({
    type: String,
  })
  linkedinUrl?: string | null;

  @ApiPropertyOptional({
    description:
      'The current role of the alumni - If the alumni is not active, this will be the last role',
    type: CurrentRoleDto,
  })
  role?: CurrentRoleDto | null;

  @ApiPropertyOptional({
    description: 'The current company of the alumni',
    type: CompanyDto,
  })
  company?: CompanyDto | null;

  @ApiPropertyOptional({
    description: 'The current location of the alumni',
    type: LocationGeo,
  })
  location?: LocationGeo | null;

  @ApiPropertyOptional({
    description: 'The graduations of the alumni',
    type: GraduationDto,
    isArray: true,
  })
  graduations?: GraduationDto[] | null;
}


export class AlumniPastLocationsAndCompaniesDto {
  Companies?: ExtendedCompanyDto[];

  Locations?: LocationGeo[];
}
