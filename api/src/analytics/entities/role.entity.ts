import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationAnalyticsEntity } from './location.entity';
import { CompanyAnalyticsEntity } from './company.entity';
import { JobClassificationAnalyticsEntity } from './job-classification.entity';
import { SENIORITY_LEVEL } from '@prisma/client';
import { RoleRawAnalyticsEntity } from './role-raw.entity';
import { RoleMetadataVo } from '../vos/role-metadata.vo';

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

  @ApiPropertyOptional({ type: CompanyAnalyticsEntity })
  company?: CompanyAnalyticsEntity;

  @ApiProperty({
    type: 'string',
    enum: SENIORITY_LEVEL,
  })
  seniorityLevel: SENIORITY_LEVEL;

  @ApiPropertyOptional({
    type: JobClassificationAnalyticsEntity,
  })
  jobClassification?: JobClassificationAnalyticsEntity;

  @ApiPropertyOptional({
    type: RoleRawAnalyticsEntity,
  })
  roleRaw?: RoleRawAnalyticsEntity;

  @ApiPropertyOptional({
    description: 'Whether the seniority level was accepted by the user',
    type: Boolean,
  })
  wasSeniorityLevelAcceptedByUser?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the seniority level was modified by the user',
    type: Boolean,
  })
  wasSeniorityLevelModifiedByUser?: boolean;

  @ApiPropertyOptional({
    description: 'The metadata of the role',
    type: RoleMetadataVo,
  })
  metadata?: RoleMetadataVo;
}
