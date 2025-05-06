import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CityListItemDto {
  @ApiProperty({
    description: 'The city ID',
    type: String,
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'The city name',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The country code of the country that the city belongs to',
    type: String,
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'The number of alumni in the city',
    type: Number,
  })
  @IsNumber()
  alumniCount: number;

  @ApiProperty({
    description: 'The number of companies in the city',
    type: Number,
  })
  @IsNumber()
  companyCount: number;
}

export class CityListResponseDto {
  @ApiProperty({ type: [CityListItemDto] })
  cities: CityListItemDto[];

  @ApiProperty({
    description:
      'The total number of cities in the database after applying the filters',
  })
  count: number;

  @ApiProperty({
    description:
      'The total number of cities in the database before applying the filters',
  })
  filteredCount: number;
}
