import { ApiProperty } from '@nestjs/swagger';
import { GRADUATION_STATUS } from '@prisma/client';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class FacultyExtraction {
  @ApiProperty({ description: 'The id of the faculty extraction' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'The id of the faculty' })
  @IsString()
  faculty_id: string;

  @ApiProperty({ description: 'The id of the course' })
  @IsString()
  course_id: string;

  @ApiProperty({ description: 'The id of the student' })
  @IsString()
  student_id: string;

  @ApiProperty({ description: 'The status of the student' })
  @IsEnum(GRADUATION_STATUS)
  status: GRADUATION_STATUS;

  @ApiProperty({ description: 'The year of the relevant student status' })
  @IsNumber()
  year: number;

  constructor(data: FacultyExtraction) {
    this.id = data.id;
    this.faculty_id = data.faculty_id;
    this.course_id = data.course_id;
    this.student_id = data.student_id;
    this.status = data.status;
    this.year = data.year;
  }
}
