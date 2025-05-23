import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationAnalyticsEntity } from './location.entity';
import { CompanyAnalyticsEntity } from './company.entity';
import { JobClassificationAnalyticsEntity } from './job-classification.entity';

export class RoleAnalyticsEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  alumniId: string;

  @ApiProperty()
  startDate: Date;

  @ApiPropertyOptional()
  endDate?: Date;

  @ApiProperty()
  isCurrent: boolean;

  @ApiPropertyOptional({ type: LocationAnalyticsEntity })
  location?: LocationAnalyticsEntity;

  @ApiProperty()
  company: CompanyAnalyticsEntity;

  @ApiPropertyOptional({
    type: JobClassificationAnalyticsEntity,
  })
  jobClassification?: JobClassificationAnalyticsEntity;
}
