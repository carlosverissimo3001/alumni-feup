import { ApiProperty } from '@nestjs/swagger';

export class IndustryListItemDto {
  @ApiProperty({
    description: 'The ID of the industry',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the industry',
    example: 'Financial Services',
  })
  name: string;

  @ApiProperty({
    description: 'The number of companies in the industry',
    example: 100,
  })
  companyCount: number;

  @ApiProperty({
    description: 'The number of alumni working in the industry',
    example: 100,
  })
  alumniCount: number;
}

export class IndustryListResponseDto {
  @ApiProperty({ type: [IndustryListItemDto] })
  industries: IndustryListItemDto[];

  @ApiProperty()
  total: number;
}
