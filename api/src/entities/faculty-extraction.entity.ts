import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

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

  @ApiProperty({ description: 'The year of the relevant student status' })
  @IsNumber()
  conclusion_year: number;

  @ApiProperty({ description: 'The full name of the student' })
  @IsString()
  full_name: string;

  constructor(data: FacultyExtraction) {
    this.id = data.id;
    this.faculty_id = data.faculty_id;
    this.course_id = data.course_id;
    this.student_id = data.student_id;
    this.conclusion_year = data.conclusion_year;
    this.full_name = data.full_name;
  }
}
