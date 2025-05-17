import { ApiProperty } from '@nestjs/swagger';
import { CourseAnalyticsEntity } from './course.entity';

export class GraduationAnalyticsEntity {
  @ApiProperty({
    description: 'The id of the graduation',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'The id of the alumni',
    type: String,
  })
  alumniId: string;

  @ApiProperty({
    description: 'The id of the course',
    type: String,
  })
  courseId: string;

  @ApiProperty({
    description: 'The year of graduation',
    type: Number,
  })
  conclusionYear: number;

  @ApiProperty({
    description: 'The course of the graduation',
    type: CourseAnalyticsEntity,
  })
  course: CourseAnalyticsEntity;
}
