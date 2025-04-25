import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompanyListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  alumniCount: number;

  @ApiPropertyOptional({ type: String, nullable: true })
  logo?: string | null;
}

export class CompanyListItemExtendedDto extends CompanyListItemDto {
  @ApiProperty()
  industry: string;

  @ApiProperty()
  industryId: string;
}

export class CompanyListResponseDto {
  @ApiProperty({ type: CompanyListItemDto, isArray: true })
  companies: CompanyListItemDto[];

  @ApiProperty({
    description:
      'The total number of companies in the database, after applying the filters',
  })
  companyTotalCount: number;

  @ApiProperty({
    description:
      'The total number of alumni in the database, after applying the filters',
  })
  alumniTotalCount: number;
}
