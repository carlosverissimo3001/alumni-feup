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

  @ApiPropertyOptional({ type: LocationAnalyticsEntity, nullable: true })
  location?: LocationAnalyticsEntity | null;
}

export class CompanyEntity extends CompanyAnalyticsEntity {
  @ApiPropertyOptional({ type: String, nullable: true })
  website?: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  founded?: number | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  companySize?: COMPANY_SIZE | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  companyType?: COMPANY_TYPE | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  linkedinUrl?: string | null;
}
