import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationAnalyticsEntity } from './location.entity';
import { CompanyAnalyticsEntity } from './company.entity';
export class RoleAnalyticsEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  alumniId: string;

  @ApiPropertyOptional({ type: LocationAnalyticsEntity, nullable: true })
  location?: LocationAnalyticsEntity | null;

  @ApiProperty()
  company: CompanyAnalyticsEntity;
}
