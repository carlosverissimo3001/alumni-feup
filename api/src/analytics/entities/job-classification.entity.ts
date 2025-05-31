import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EscoClassificationAnalyticsEntity } from './esco-classification.entity';

export class JobClassificationAnalyticsEntity {
  @ApiProperty()
  escoClassificationId: string;

  @ApiProperty()
  roleId: string;

  @ApiPropertyOptional({
    description: 'The confidence of the job classification',
    type: Number,
  })
  confidence?: number | null;

  @ApiProperty()
  escoClassification: EscoClassificationAnalyticsEntity;

  @ApiProperty({
    description: 'Whether the seniority level was accepted by the user',
    type: Boolean,
  })
  wasAcceptedByUser: boolean;
}
