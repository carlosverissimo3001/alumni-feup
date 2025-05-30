import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { DataPointDto } from './data-point.dto';
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
    description: 'The latitude of the city',
    type: Number,
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({
    description: 'The longitude of the city',
    type: Number,
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({
    description: 'The number of alumni in the city',
    type: Number,
  })
  @IsNumber()
  count: number;

  @ApiProperty({
    description: 'The alumni count trend of the city',
    type: DataPointDto,
    isArray: true,
  })
  trend: DataPointDto[];
}

export class CityListResponseDto {
  @ApiProperty({ type: [CityListItemDto] })
  cities: CityListItemDto[];

  @ApiProperty({
    description:
      'The total number of cities in the database after applying the filters',
  })
  count: number;
}
