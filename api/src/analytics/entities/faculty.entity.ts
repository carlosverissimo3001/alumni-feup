import { ApiProperty } from '@nestjs/swagger';

export class FacultyAnalyticsEntity {
  @ApiProperty({
    description: 'The id of the faculty',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'The name of the faculty',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'The international name of the faculty',
    type: String,
  })
  nameInt: string;

  @ApiProperty({
    description: 'The acronym of the faculty',
    type: String,
  })
  acronym: string;
}
