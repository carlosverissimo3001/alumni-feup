import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadExtractionDto {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  facultyId: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  courseId: string;
}
