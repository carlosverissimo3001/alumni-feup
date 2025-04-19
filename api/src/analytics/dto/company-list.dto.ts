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

export class CompanyListResponseDto {
  @ApiProperty({ type: [CompanyListItemDto] })
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
