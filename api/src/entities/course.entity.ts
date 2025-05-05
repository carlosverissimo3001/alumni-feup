import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { COURSE_STATUS, COURSE_TYPE } from '@prisma/client';

export class Course {
  @ApiProperty({ description: 'The id of the course', type: String })
  id: string;

  @ApiProperty({ description: 'The name of the course', type: String })
  name: string;

  @ApiProperty({ description: 'The acronym of the course', type: String })
  acronym: string;
}

export class CourseExtended extends Course {
  @ApiProperty({ description: 'The start year of the course', type: Number })
  startYear: number;

  @ApiPropertyOptional({
    description: 'The end year of the course, if it is not active',
    type: Number,
  })
  endYear?: number | null;

  @ApiProperty({ description: 'The status of the course', enum: COURSE_STATUS })
  status: COURSE_STATUS;

  @ApiProperty({ description: 'The faculty id of the course', type: String })
  facultyId: string;

  @ApiPropertyOptional({
    description: 'The name of the course in the international language',
    type: String,
  })
  nameInt?: string | null;

  @ApiProperty({ description: 'The type of the course', enum: COURSE_TYPE })
  courseType: COURSE_TYPE;
}
