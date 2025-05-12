import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JobClassificationAnalyticsEntity {
  @ApiProperty()
  name: string;

  @ApiProperty()
  escoCode: string;

  @ApiProperty()
  level: number;

  @ApiPropertyOptional()
  confidence?: number | null;
}
