import { IsDate, IsNumber, IsString } from '@nestjs/class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class JobClassification {
  @ApiProperty({ description: 'The id of the job classification' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'The title of the job classification' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'The level of the job classification' })
  @IsNumber()
  level: number;

  @ApiProperty({ description: 'The esco code of the job classification' })
  @IsString()
  esco_code: string;

  @ApiProperty({ description: 'The confidence of the job classification' })
  @IsNumber()
  confidence: number;

  @ApiProperty({ description: 'The role id of the job classification' })
  @IsString()
  role_id: string;

  @ApiProperty({ description: 'The creation date of the job classification' })
  @IsDate()
  created_at: Date;
}
