import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JobClassificationAnalyticsEntity {
  @ApiProperty()
  title: string;

  @ApiProperty()
  escoCode: string;

  @ApiProperty()
  level: number;

  @ApiPropertyOptional()
  confidence?: number | null;

  @ApiProperty()
  ranking: number;
}
