import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DataPointDto } from './data-point.dto';
export class CompanyListItemDto {
  @ApiProperty({
    description: 'The ID of the company',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'The name of the company',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'The number of alumni in the company',
    type: Number,
  })
  count: number;

  @ApiProperty({
    description: 'The trend of the company',
    type: DataPointDto,
    isArray: true,
  })
  trend: DataPointDto[];

  @ApiPropertyOptional({ type: String })
  logo?: string;

  @ApiPropertyOptional({ type: String })
  levelsFyiUrl?: string;
}

export class CompanyListItemExtendedDto extends CompanyListItemDto {
  @ApiProperty({
    description: 'The industry name of the company',
    type: String,
  })
  industry: string;

  @ApiProperty({
    description: 'The ID of the industry',
    type: String,
  })
  industryId: string;
}

export class CompanyListResponseDto {
  @ApiProperty({ type: CompanyListItemDto, isArray: true })
  companies: CompanyListItemDto[];

  @ApiProperty({
    description:
      'The total number of companies in the database, after applying the filters',
    type: Number,
  })
  companyCount: number;

  @ApiProperty({
    description:
      'The total number of alumni in the database, after applying the filters',
    type: Number,
  })
  alumniCount: number;
}
