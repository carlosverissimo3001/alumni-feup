import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IndustryAnalyticsEntity } from './industry.entity';
import { LocationAnalyticsEntity } from './location.entity';
import { COMPANY_TYPE, COMPANY_SIZE } from '@prisma/client';
export class CompanySummaryEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class CompanyAnalyticsEntity extends CompanySummaryEntity {
  @ApiPropertyOptional({ type: String })
  logo?: string;

  @ApiPropertyOptional({ type: String })
  levelsFyiUrl?: string;

  @ApiProperty()
  industry: IndustryAnalyticsEntity;

  @ApiPropertyOptional({ type: LocationAnalyticsEntity })
  location?: LocationAnalyticsEntity;

  @ApiPropertyOptional({ type: String })
  website?: string;

  @ApiPropertyOptional({ type: Number })
  founded?: number;

  @ApiPropertyOptional({ type: String })
  companySize?: COMPANY_SIZE;

  @ApiPropertyOptional({ type: String })
  companyType?: COMPANY_TYPE;

  @ApiPropertyOptional({ type: String })
  linkedinUrl?: string;
}
