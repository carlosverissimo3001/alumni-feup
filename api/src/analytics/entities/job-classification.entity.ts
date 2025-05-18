import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EscoClassificationAnalyticsEntity } from './esco-classification.entity';

export class JobClassificationAnalyticsEntity {
  @ApiProperty()
  escoClassificationId: string;

  @ApiProperty()
  roleId: string;

  @ApiPropertyOptional()
  confidence?: number | null;

  @ApiProperty()
  escoClassification: EscoClassificationAnalyticsEntity;
}
