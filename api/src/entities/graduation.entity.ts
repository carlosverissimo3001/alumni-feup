import { ApiProperty } from '@nestjs/swagger';
import { Course } from './course.entity';

export class Graduation {
  @ApiProperty({ description: 'The conclusion year of the graduation' })
  conclusionYear?: number | null;

  @ApiProperty({ description: 'The course of the graduation' })
  Course: Course;
}

export class GraduationExtended extends Graduation {
  @ApiProperty({ description: 'The id of the alumni' })
  alumniId: string;

  @ApiProperty({ description: 'The id of the course' })
  courseId: string;
}
