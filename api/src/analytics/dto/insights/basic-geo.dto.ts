import { ApiProperty } from '@nestjs/swagger';

export class BasicGeoDto {
  @ApiProperty({ description: 'The country name', type: String })
  country: string;

  @ApiProperty({ description: 'The code of the country', type: String })
  code: string;

  @ApiProperty({
    description: 'The number of alumni in the country',
    type: Number,
  })
  count: number;
}
