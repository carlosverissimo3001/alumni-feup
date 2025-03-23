import { UPLOAD_TYPE } from '@/consts/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UploadExtractionDto {
  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  faculty_id: string;

  @ApiProperty({ type: 'string' })
  @IsNotEmpty()
  course_id: string;

  @ApiProperty({
    description: 'The type of upload',
    enum: UPLOAD_TYPE,
    enumName: 'UPLOAD_TYPE',
  })
  @IsNotEmpty()
  @IsEnum(UPLOAD_TYPE)
  upload_type: UPLOAD_TYPE;
}
