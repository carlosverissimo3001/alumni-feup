import { ApiPropertyOptional } from '@nestjs/swagger';

export class JobClassificationChoiceVo {
  @ApiPropertyOptional({
    description: 'The id of the choice',
    type: String,
  })
  id: string;

  @ApiPropertyOptional({
    description: 'The title of the choice',
    type: String,
  })
  title: string;

  @ApiPropertyOptional({
    description: 'The confidence of the choice',
    type: Number,
  })
  confidence: number;

  constructor(data: JobClassificationChoiceVo) {
    this.id = data.id;
    this.title = data.title;
    this.confidence = data.confidence;
  }
}

export class JobClassificationMetadataVo {
  @ApiPropertyOptional({
    description:
      'The top 3 choices that the llm provided for the job classification',
    type: JobClassificationChoiceVo,
    isArray: true,
  })
  choices: JobClassificationChoiceVo[];

  @ApiPropertyOptional({
    description: 'The reasoning behind the choice',
    type: String,
  })
  reasoning: string;

  constructor(data: Partial<JobClassificationMetadataVo>) {
    Object.assign(this, data);
  }
}
