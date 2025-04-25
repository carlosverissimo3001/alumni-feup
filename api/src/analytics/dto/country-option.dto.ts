import { ApiProperty } from '@nestjs/swagger';

export class CountryOptionDto {
  @ApiProperty({
    description: 'The unique country ISO code',
    example: 'US',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the country',
    example: 'United States',
  })
  name: string;
}
