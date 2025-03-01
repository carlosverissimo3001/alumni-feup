import {
  IsISO31661Alpha2,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
} from '@nestjs/class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Location {
  @ApiProperty({ description: 'The id of the location' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'The city of the location' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'The country of the location' })
  @IsString()
  country: string;

  @ApiPropertyOptional({ description: 'The latitude of the location' })
  @IsOptional()
  @IsLatitude()
  latitude: number;

  @ApiPropertyOptional({ description: 'The longitude of the location' })
  @IsOptional()
  @IsLongitude()
  longitude: number;

  @ApiProperty({ description: 'The country code of the location' })
  @IsString()
  @IsISO31661Alpha2()
  country_code: string;
}
