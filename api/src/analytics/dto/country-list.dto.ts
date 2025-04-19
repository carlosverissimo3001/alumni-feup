import { ApiProperty } from '@nestjs/swagger';

export class CountryListItemDto {
  @ApiProperty({
    description: 'The country ID',
  })
  id: string;

  @ApiProperty({
    description: 'The country name',
  })
  name: string;

  @ApiProperty({
    description: 'The country code (ISO 3166-1 alpha-2)',
  })
  code: string;

  @ApiProperty({
    description: 'The number of alumni in the country',
  })
  alumniCount: number;

  @ApiProperty({
    description: 'The number of companies in the country',
  })
  companyCount: number;
}

export class CountryListResponseDto {
  @ApiProperty({ type: [CountryListItemDto] })
  countries: CountryListItemDto[];

  @ApiProperty({
    description:
      'The total number of countries in the database after applying the filters',
  })
  total: number;
}
