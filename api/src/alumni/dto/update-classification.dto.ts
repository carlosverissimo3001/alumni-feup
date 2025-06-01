import { ApiProperty } from '@nestjs/swagger';

export class UpdateClassificationDto {
  @ApiProperty({
    description: 'The new ESCO classification of the role',
    type: String,
  })
  escoClassificationId: string;
}
