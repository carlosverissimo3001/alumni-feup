import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocationGeo {
  @ApiProperty({ description: 'The city of the location' })
  city?: string | null;

  @ApiProperty({ description: 'The country of the location' })
  country?: string | null;

  @ApiPropertyOptional({ description: 'The latitude of the location' })
  latitude?: number | null;

  @ApiPropertyOptional({ description: 'The longitude of the location' })
  longitude?: number | null;
}

export class Location extends LocationGeo {
  @ApiProperty({ description: 'The id of the location' })
  id: string;

  @ApiProperty({ description: 'The country code of the location' })
  countryCode: string;

  @ApiProperty({ description: 'The created at date of the location' })
  createdAt: Date;

  @ApiProperty({ description: 'The updated at date of the location' })
  updatedAt: Date;
}
