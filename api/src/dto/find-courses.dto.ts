import { COURSE_STATUS } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsEnum } from 'class-validator';

export class FindCoursesDto {
  @ApiPropertyOptional({
    description: 'The id of the faculty',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  faculty_id?: string;

  @ApiPropertyOptional({
    description: 'Course status',
    enum: COURSE_STATUS,
    required: false,
  })
  @IsEnum(COURSE_STATUS)
  @IsOptional()
  status?: COURSE_STATUS;

  @ApiPropertyOptional({
    description: 'Search by course name',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;
}
