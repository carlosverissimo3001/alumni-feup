import {
    IsString,
    IsEmail,
    IsOptional,
    Min,
    Max,
    IsNumber,
    IsInt,
  } from 'class-validator';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewType } from '@/entities/reviewgeojson.entity';
  

export class CreateReviewDto {
    @ApiProperty({ description: 'The id of the alumni' })
    @IsString()
    alumniId: string;

    @ApiProperty({ description: 'The review description' })
    @IsString()
    description: string;
  
    @ApiPropertyOptional({ description: 'The review rating' })
    @IsNumber()
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;
  
    @ApiProperty({ description: 'The Type of Review' })
    @IsString()
    reviewType: string;

    @ApiProperty({ description: 'The id of the location' })
    @IsOptional()
    @IsString()
    companyId?: string;

    @ApiProperty({ description: 'The id of the location' })
    @IsOptional()
    @IsString()
    locationId?: string;
  }