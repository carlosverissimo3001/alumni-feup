import { IsDate, IsNumber, IsString } from '@nestjs/class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JobClassification {
  @ApiPropertyOptional({
    description: 'The esco code of the job classification',
    type: String,
  })
  escoCode?: string | null;

  @ApiProperty({ description: 'The title of the job classification' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'The level of the job classification' })
  @IsNumber()
  level: number;

  constructor(data: JobClassification) {
    this.escoCode = data.escoCode;
    this.title = data.title;
    this.level = data.level;
  }
}

export class JobClassificationExtended extends JobClassification {
  @ApiProperty({ description: 'The id of the job classification' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'The confidence of the job classification' })
  @IsNumber()
  confidence: number;

  @ApiProperty({ description: 'The role id of the job classification' })
  @IsString()
  role_id: string;

  @ApiProperty({ description: 'The creation date of the job classification' })
  @IsDate()
  created_at: Date;

  constructor(data: JobClassificationExtended) {
    super(data);
    this.id = data.id;
    this.confidence = data.confidence;
    this.role_id = data.role_id;
    this.created_at = data.created_at;
  }
}
