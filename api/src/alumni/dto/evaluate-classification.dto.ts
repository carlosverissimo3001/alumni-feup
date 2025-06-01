import { ApiProperty } from '@nestjs/swagger';

export class EvaluateClassificationDto {
  @ApiProperty({
    description: 'Whether the job classification was accepted by the user',
    type: Boolean,
  })
  wasAcceptedByUser: boolean;
}
