import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UploadExtractionDto {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  faculty_id: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  course_id: string;
}
