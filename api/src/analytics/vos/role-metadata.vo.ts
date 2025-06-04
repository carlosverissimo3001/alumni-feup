import { ApiPropertyOptional } from '@nestjs/swagger';

export class SeniorityClassificationVo {
  @ApiPropertyOptional({
    description: 'The model that was used to classify the seniority level',
    type: String,
    example: 'gpt-4o-mini',
  })
  model?: string;

  @ApiPropertyOptional({
    description: 'The reasoning behind the classification',
    type: String,
    example: 'The user is a senior software engineer',
  })
  reasoning?: string;

  @ApiPropertyOptional({
    description: 'The confidence of the classification',
    type: Number,
    example: 0.95,
  })
  confidence?: number;

  constructor(data: Partial<SeniorityClassificationVo>) {
    Object.assign(this, data);
  }
}

export class RoleMetadataVo {
  @ApiPropertyOptional({
    description: 'The seniority level classification metadata',
    type: SeniorityClassificationVo,
  })
  seniority_classification?: SeniorityClassificationVo;

  constructor(data: Partial<RoleMetadataVo>) {
    Object.assign(this, data);
  }
}
