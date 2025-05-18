import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EscoClassificationAnalyticsEntity {
  @ApiProperty()
  titleEn: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  level: number;

  @ApiPropertyOptional()
  isLeaf: boolean;
}
