import { ApiProperty } from '@nestjs/swagger';

export class AlumniOptionDto {
  @ApiProperty({
    description: 'The unique ID of the alumni',
    type: 'string',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the alumni',
    example: 'John Smith',
  })
  fullName: string;
}
