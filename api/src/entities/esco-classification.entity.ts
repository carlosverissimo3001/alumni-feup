import { ApiProperty } from '@nestjs/swagger';

export class EscoClassification {
  @ApiProperty({ description: 'The id of the esco classification' })
  id: string;

  @ApiProperty({ description: 'The title of the esco classification' })
  titleEn: string;

  @ApiProperty({ description: 'The code of the esco classification' })
  code: string;

  @ApiProperty({ description: 'Whether the esco classification is a leaf' })
  isLeaf: boolean;
}
