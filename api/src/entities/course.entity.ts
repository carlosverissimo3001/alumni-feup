import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsEnum } from '@nestjs/class-validator';
import { COURSE_STATUS, COURSE_TYPE } from '@prisma/client';


export class Course {
  @ApiProperty({ description: 'The name of the course' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The acronym of the course' })
  @IsString()
  acronym: string;
}

export class CourseExtended extends Course {
  @ApiProperty({ description: 'The id of the course' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'The start year of the course' })
  @IsInt()
  start_year: number;

  @ApiPropertyOptional({
    description: 'The end year of the course, if it is not active',
  })
  @IsOptional()
  @IsInt()
  end_year?: number | null;

  @ApiProperty({ description: 'The status of the course' })
  @IsString()
  @IsEnum(COURSE_STATUS)
  status: COURSE_STATUS;

  @ApiProperty({ description: 'The faculty id of the course' })
  @IsString()
  faculty_id: string;

  @ApiPropertyOptional({
    description: 'The name of the course in the international language',
  })
  @IsOptional()
  @IsString()
  name_int?: string | null;

  @ApiProperty({ description: 'The type of the course' })
  @IsEnum(COURSE_TYPE)
  course_type: COURSE_TYPE;
}
