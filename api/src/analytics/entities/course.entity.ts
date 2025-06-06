import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { COURSE_STATUS, COURSE_TYPE } from '@prisma/client';
import { FacultyAnalyticsEntity } from './faculty.entity';

export class CourseAnalyticsEntity {
  @ApiProperty({
    description: 'The id of the course',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'The name of the course',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'The acronym of the course',
    type: String,
  })
  acronym: string;

  @ApiProperty({
    description: 'The status of the course',
    enum: COURSE_STATUS,
  })
  status: COURSE_STATUS;

  @ApiProperty({
    description: 'The course type of the course',
    enum: COURSE_TYPE,
  })
  courseType: COURSE_TYPE;

  @ApiProperty({
    description: 'The faculty acronym of the course',
    type: String,
  })
  facultyAcronym: string;

  @ApiProperty({
    description: 'The start year of the course',
    type: Number,
  })
  startYear: number;

  @ApiPropertyOptional({
    description: 'The year in which the course ceased to exist',
    type: Number,
  })
  endYear?: number;

  @ApiProperty({
    description: 'The faculty id of the course',
    type: String,
  })
  facultyId: string;
}
