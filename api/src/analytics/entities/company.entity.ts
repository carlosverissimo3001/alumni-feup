import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IndustryAnalyticsEntity } from './industry.entity';
import { LocationAnalyticsEntity } from './location.entity';

export class CompanyAnalyticsEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  logo?: string | null;

  @ApiProperty()
  industry: IndustryAnalyticsEntity;

  @ApiPropertyOptional({ type: LocationAnalyticsEntity, nullable: true })
  location?: LocationAnalyticsEntity | null;
}
