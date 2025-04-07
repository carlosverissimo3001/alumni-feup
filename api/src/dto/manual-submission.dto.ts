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
  @ApiProperty({ description: 'The full name of the user' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ description: 'The personal email of the user' })
  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @ApiProperty({ description: 'The LinkedIn URL of the user' })
  @IsUrl()
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

  @ApiProperty({ description: 'The faculty ID of the user' })
  @IsString()
  facultyId: string;
}
