import { ApiProperty } from '@nestjs/swagger';

export class CompanyOptionDto {
  @ApiProperty({})
  id: string;

  @ApiProperty({})
  name: string;
}
