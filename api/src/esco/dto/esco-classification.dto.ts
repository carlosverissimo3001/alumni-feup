import { ApiProperty } from '@nestjs/swagger';

export class EscoClassificationDto {
  @ApiProperty({
    description: 'The ESCO code for the classification',
    example: '2512',
    type: String,
  })
  escoCode: string;

  @ApiProperty({
    description: 'The title for the classification',
    example: 'Software Engineer',
    type: String,
  })
  title: string;
}
