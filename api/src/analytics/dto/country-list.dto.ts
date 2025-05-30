import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DataPointDto } from './data-point.dto';

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

  @ApiPropertyOptional({
    description: 'The latitude of the country',
    type: Number,
  })
  latitude?: number;

  @ApiPropertyOptional({
    description: 'The longitude of the country',
    type: Number,
  })
  longitude?: number;

  @ApiProperty({
    description: 'The number of alumni in the country',
  })
  count: number;

  @ApiProperty({
    description: 'The alumni count trend of the country',
    type: DataPointDto,
    isArray: true,
  })
  trend: DataPointDto[];
}

export class CountryListResponseDto {
  @ApiProperty({ type: [CountryListItemDto] })
  countries: CountryListItemDto[];

  @ApiProperty({
    description:
      'The total number of countries in the database after applying the filters',
  })
  count: number;
}
