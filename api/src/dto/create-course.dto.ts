import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { COURSE_STATUS, COURSE_TYPE } from '@prisma/client';
import { ValidateIf } from '@nestjs/class-validator';

export class CreateCourseDto {
  @ApiProperty({
    description: 'The name of the course',
    example: 'Computer Science',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'The international name of the course',
    example: 'Computer Science',
  })
  @IsString()
  @IsOptional()
  nameInt?: string;

  @ApiProperty({
    description: 'The acronym of the course',
    example: 'CS',
  })
  @IsString()
  @IsNotEmpty()
  acronym: string;

  @ApiProperty({
    description: 'The type of the course',
    example: COURSE_TYPE.BACHELORS,
    enum: COURSE_TYPE,
  })
  @IsEnum(COURSE_TYPE)
  @IsNotEmpty()
  courseType: COURSE_TYPE;

  @ApiProperty({
    description: 'The status of the course',
    example: COURSE_STATUS.ACTIVE,
    enum: COURSE_STATUS,
  })
  @IsEnum(COURSE_STATUS)
  @IsNotEmpty()
  status: COURSE_STATUS;

  @ApiProperty({
    description: 'The faculty id of the course',
    example: '123',
  })
  @IsString()
  @IsNotEmpty()
  facultyId: string;

  @ApiProperty({
    description: 'The start year of the course',
    example: 2020,
  })
  @IsInt()
  startYear: number;

  @ApiPropertyOptional({
    description: 'If the course is INACTIVE, the end year of the course',
    example: 2024,
  })
  @ValidateIf(
    (object: CreateCourseDto) => object.status === COURSE_STATUS.INACTIVE,
  )
  @IsOptional()
  @IsInt()
  endYear?: number;

  @ApiPropertyOptional({
    description: 'The created by of the course',
    example: '123',
  })
  @IsString()
  @IsOptional()
  createdBy?: string;
}
