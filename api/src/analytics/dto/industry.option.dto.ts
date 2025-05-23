import { ApiProperty } from '@nestjs/swagger';

export class IndustryOptionDto {
  @ApiProperty({
    description: 'The ID of the industry',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the industry',
  })
  name: string;
}
