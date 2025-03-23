import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from '@nestjs/class-validator';
import { Course } from './course.entity';

export class Graduation {
  @ApiProperty({ description: 'The conclusion year of the graduation' })
  @IsOptional()
  @IsInt()
  conclusion_year?: number | null;

  @ApiProperty({ description: 'The course of the graduation' })
  @IsString()
  Course: Course;
}

export class GraduationExtended extends Graduation {
  @ApiProperty({ description: 'The id of the alumni' })
  @IsString()
  alumni_id: string;

  @ApiProperty({ description: 'The id of the course' })
  @IsString()
  course_id: string;
}
