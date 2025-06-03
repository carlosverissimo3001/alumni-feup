import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateClassificationDto {
  @ApiProperty({
    description: 'The new ESCO classification of the role',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  escoClassificationId: string;
}
