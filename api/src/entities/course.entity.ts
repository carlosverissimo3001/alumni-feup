import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { COURSE_STATUS, COURSE_TYPE } from '@prisma/client';

export class Course {
  @ApiProperty({ description: 'The id of the course' })
  id: string;

  @ApiProperty({ description: 'The name of the course' })
  name: string;

  @ApiProperty({ description: 'The acronym of the course' })
  acronym: string;
}

export class CourseExtended extends Course {
  @ApiProperty({ description: 'The start year of the course' })
  startYear: number;

  @ApiPropertyOptional({
    description: 'The end year of the course, if it is not active',
  })
  endYear?: number | null;

  @ApiProperty({ description: 'The status of the course' })
  status: COURSE_STATUS;

  @ApiProperty({ description: 'The faculty id of the course' })
  facultyId: string;

  @ApiPropertyOptional({
    description: 'The name of the course in the international language',
  })
  nameInt?: string | null;

  @ApiProperty({ description: 'The type of the course' })
  courseType: COURSE_TYPE;
}
