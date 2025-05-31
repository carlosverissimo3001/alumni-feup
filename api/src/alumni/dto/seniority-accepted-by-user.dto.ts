import { ApiProperty } from '@nestjs/swagger';

export class SeniorityLevelAcceptedByUserDto {
  @ApiProperty({
    description: 'Whether the seniority level was accepted by the user',
    type: Boolean,
  })
  wasSeniorityLevelAcceptedByUser: boolean;
}
