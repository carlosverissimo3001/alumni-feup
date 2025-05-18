import { IsDate, IsNumber, IsString } from '@nestjs/class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { EscoClassification } from './esco-classification.entity';

export class JobClassification {
  @ApiProperty()
  id: string;

  @ApiProperty()
  roleId: string;

  @ApiProperty()
  escoClassificationId: string;

  @ApiProperty({ nullable: true })
  confidence: number | null;

  @ApiProperty()
  EscoClassification: EscoClassification;

  constructor(data: JobClassification) {
    this.id = data.id;
    this.roleId = data.roleId;
    this.escoClassificationId = data.escoClassificationId;
    this.confidence = data.confidence;
    this.EscoClassification = data.EscoClassification;
  }
}
