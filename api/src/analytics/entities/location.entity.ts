import { ApiProperty } from '@nestjs/swagger';

export class LocationAnalyticsEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  countryCode: string;

  @ApiProperty()
  city: string;
}
