import {
    IsString,
    IsBoolean,
  } from 'class-validator';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
  

export class ChangeReviewScoreDto {
    @ApiProperty({ description: 'The id of the alumni' })
    @IsString()
    @Transform(({ value }) => (value ? String(value) : undefined))
    alumniId: string;

    @ApiProperty({ description: 'The id of the review' })
    @IsString()
    @Transform(({ value }) => (value ? String(value) : undefined))
    reviewId: string;
  
    @ApiProperty({ description: 'The review rating' })
    @IsBoolean()
    @Transform(({ value }) => (value ? Boolean(value) : Boolean(value)))
    upvote: boolean;
  }