import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IndustryAnalyticsEntity } from './industry.entity';
import { RoleAnalyticsEntity } from './role.entity';

export class CompanyAnalyticsEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  logo?: string | null;

  @ApiProperty()
  industry: IndustryAnalyticsEntity;

  @ApiProperty()
  roles: RoleAnalyticsEntity[];
}
