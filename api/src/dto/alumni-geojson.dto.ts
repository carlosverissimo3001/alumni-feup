import { ApiProperty } from '@nestjs/swagger';

export class AlumniGeoJSONResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  linkedin_url: string;

  @ApiProperty({ nullable: true })
  profile_picture_url: string | null;

  @ApiProperty()
  Roles: Array<{
    Location: {
      country: string | null;
      city: string | null;
      latitude: number | null;
      longitude: number | null;
    } | null;
    JobClassification: Array<{
      title: string;
      level: number;
    }>;
    Company: {
      name: string;
    };
  }>;

  @ApiProperty({ nullable: true })
  Location: {
    country: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;

  @ApiProperty()
  Graduations: Array<{
    status: string;
    conclusion_year: number | null;
    Course: {
      name: string;
      acronym: string;
    };
  }>;
} 