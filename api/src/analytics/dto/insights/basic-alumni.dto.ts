import { ApiProperty } from '@nestjs/swagger';
import { SENIORITY_LEVEL } from '@/consts';

export class BasicAlumniDto {
  @ApiProperty({ description: 'The id of the alumni', type: String })
  id: string;

  @ApiProperty({ description: 'The name of the alumni', type: String })
  name: string;

  @ApiProperty({ description: 'The seniority of the role', type: String })
  seniority: SENIORITY_LEVEL;

  @ApiProperty({ description: 'The role start date', type: String })
  startDate: string;

  @ApiProperty({
    description: 'The role end date, if applicable',
    type: String,
  })
  endDate: string;
}
