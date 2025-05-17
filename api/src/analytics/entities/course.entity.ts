import { ApiProperty } from '@nestjs/swagger';
import { COURSE_STATUS } from '@prisma/client';
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
    description: 'The faculty acronym of the course',
    type: String,
  })
  facultyAcronym: string;


  @ApiProperty({
    description: 'The faculty id of the course',
    type: String,
  })
  facultyId: string;

  @ApiProperty({
    description: 'The faculty of the course',
    type: FacultyAnalyticsEntity,
  })
  faculty: FacultyAnalyticsEntity;
}
