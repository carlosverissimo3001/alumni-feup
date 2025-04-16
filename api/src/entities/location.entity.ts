import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocationGeo {
  @ApiPropertyOptional({
    description: 'The city of the location',
    type: String,
  })
  city?: string | null;

  @ApiPropertyOptional({
    description: 'The country of the location',
    type: String,
  })
  country?: string | null;

  @ApiPropertyOptional({
    description: 'The country code of the location',
    type: String,
  })
  countryCode?: string | null;

  @ApiPropertyOptional({
    description: 'The latitude of the location',
    type: Number,
  })
  latitude?: number | null;

  @ApiPropertyOptional({
    description: 'The longitude of the location',
    type: Number,
  })
  longitude?: number | null;
}

export class Location extends LocationGeo {
  @ApiProperty({ description: 'The id of the location' })
  id: string;

  @ApiProperty({ description: 'The created at date of the location' })
  createdAt: Date;

  @ApiProperty({ description: 'The updated at date of the location' })
  updatedAt: Date;
}
