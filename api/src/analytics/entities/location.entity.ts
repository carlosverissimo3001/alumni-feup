import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocationAnalyticsEntity {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({
    description: 'The country of the location',
    type: String,
  })
  country?: string;

  @ApiPropertyOptional()
  countryCode?: string;

  @ApiPropertyOptional({
    description: 'The city of the location',
    type: String,
  })
  city?: string;

  @ApiPropertyOptional({
    description: 'The latitude of the location',
    type: Number,
  })
  latitude?: number;

  @ApiPropertyOptional({
    description: 'The longitude of the location',
    type: Number,
  })
  longitude?: number;
}
