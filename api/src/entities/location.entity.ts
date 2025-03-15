import {
  IsISO31661Alpha2,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
} from '@nestjs/class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocationGeo {
  @ApiProperty({ description: 'The city of the location' })
  @IsString()
  city?: string | null;

  @ApiProperty({ description: 'The country of the location' })
  @IsString()
  country?: string | null;

  @ApiPropertyOptional({ description: 'The latitude of the location' })
  @IsOptional()
  @IsLatitude()
  latitude?: number | null;

  @ApiPropertyOptional({ description: 'The longitude of the location' })
  @IsOptional()
  @IsLongitude()
  longitude?: number | null;
}

export class Location extends LocationGeo {
  @ApiProperty({ description: 'The id of the location' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'The country code of the location' })
  @IsString()
  @IsISO31661Alpha2()
  country_code: string;
}
