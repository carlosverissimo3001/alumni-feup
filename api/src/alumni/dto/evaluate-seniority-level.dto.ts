import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class EvaluateSeniorityLevelDto {
  @ApiProperty({
    description: 'Whether the seniority level was accepted by the user',
    type: Boolean,
  })
  @IsNotEmpty()
  wasSeniorityLevelAcceptedByUser: boolean;
}
