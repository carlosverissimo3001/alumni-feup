import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocationAnalyticsEntity {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ nullable: true })
  country?: string | null;

  @ApiPropertyOptional({ nullable: true })
  countryCode?: string | null;

  @ApiPropertyOptional({ nullable: true })
  city?: string | null;
}
