import { IsOptional } from '@nestjs/class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { IsString } from 'class-validator';

// Docs: https://learn.microsoft.com/en-us/linkedin/shared/references/v2/profile/basic-profile
export class LinkedinAuthDto {
  @ApiProperty({
    description:
      'A unique identifying value for the member. Referenced as personId in other API documentation pages.',
  })
  @IsString()
  @IsNotEmpty()
  person_id: string;

  @ApiProperty({
    description: 'The first name of the member.',
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    description: 'The first name of the member.',
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiPropertyOptional({
    description: 'The personal email of the member.',
  })
  @IsString()
  @IsOptional()
  institutional_email?: string;

  @ApiPropertyOptional({
    description: "The URL of the member's profile picture.",
  })
  @IsString()
  @IsOptional()
  profile_picture_url?: string;

  @ApiPropertyOptional({
    description: "The LinkedIn URL of the member.",
  })
  @IsString()
  @IsOptional()
  linkedin_url?: string;
}
