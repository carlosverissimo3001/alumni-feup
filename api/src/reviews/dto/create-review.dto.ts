import {
  IsString,
  IsOptional,
  Min,
  Max,
  IsNumber,
  IsInt,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'The id of the alumni' })
  @IsString()
  @Transform(({ value }) => (value ? String(value) : undefined))
  alumniId: string;

  @ApiProperty({ description: 'The review description' })
  @IsString()
  @Transform(({ value }) => (value ? String(value) : undefined))
  description: string;

  @ApiPropertyOptional({ description: 'The review rating' })
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => (value ? Number(value) : undefined))
  rating: number;

  @ApiProperty({ description: 'The Type of Review' })
  @IsString()
  @Transform(({ value }) => (value ? String(value) : undefined))
  reviewType: string;

  @ApiProperty({ description: 'The id of the location' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value ? String(value) : undefined))
  companyId?: string;

  @ApiProperty({ description: 'The id of the location' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value ? String(value) : undefined))
  locationId?: string;
}
