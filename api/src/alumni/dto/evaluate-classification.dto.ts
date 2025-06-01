import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class EvaluateClassificationDto {
  @ApiProperty({
    description: 'Whether the job classification was accepted by the user',
    type: Boolean,
  })
  @IsNotEmpty()
  wasAcceptedByUser: boolean;
}
