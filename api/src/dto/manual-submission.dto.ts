import {
  IsInt,
  IsNotEmpty,
  IsArray,
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class CourseCompletion {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The ID of the course' })
  courseId: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: 'The year of conclusion of the course' })
  conclusionYear: number;
}

export class ManualSubmissionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The full name of the user' })
  fullName: string;

  @ApiPropertyOptional({ description: 'The personal email of the user' })
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  personalEmail?: string;

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({ description: 'The LinkedIn URL of the user' })
  linkedinUrl: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseCompletion)
  @ApiProperty({
    description: 'The courses the user has completed',
    type: () => CourseCompletion,
    isArray: true,
  })
  courses: CourseCompletion[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The faculty ID of the user' })
  facultyId: string;
}
