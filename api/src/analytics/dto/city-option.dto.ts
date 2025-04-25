import { ApiProperty } from '@nestjs/swagger';

export class CityOptionDto {
  @ApiProperty({
    description: 'The unique ID of the city',
    type: 'string',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the city',
    example: 'San Francisco',
  })
  name: string;

  @ApiProperty({
    description: 'The country of the city',
    example: 'United States',
  })
  country: string;
}
