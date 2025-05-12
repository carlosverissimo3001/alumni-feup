import { ApiProperty } from '@nestjs/swagger';

export class DataPointDto {
  @ApiProperty({
    description: 'The label of the data point',
    type: String,
    example: '2021-01-01',
  })
  label: string;

  @ApiProperty({
    description: 'The value of the data point',
    type: Number,
    example: 100,
  })
  value: number;
}
