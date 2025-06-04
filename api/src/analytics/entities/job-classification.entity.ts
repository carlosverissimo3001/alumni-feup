import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EscoClassificationAnalyticsEntity } from './esco-classification.entity';
import { JobClassificationMetadataVo } from '../vos/job-classification.metadata.vo';

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

  @ApiPropertyOptional({
    description: 'Whether the job classification was accepted by the user',
    type: Boolean,
  })
  wasAcceptedByUser?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the job classification was modified by the user',
    type: Boolean,
  })
  wasModifiedByUser?: boolean;

  @ApiPropertyOptional({
    description: 'The metadata of the job classification',
    type: JobClassificationMetadataVo,
  })
  metadata?: JobClassificationMetadataVo;
}
