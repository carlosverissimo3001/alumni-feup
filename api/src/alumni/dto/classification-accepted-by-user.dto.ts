import { ApiProperty } from '@nestjs/swagger';

export class ClassificationAcceptedByUserDto {
  @ApiProperty({
    description: 'Whether the job classification was accepted by the user',
    type: Boolean,
  })
  wasAcceptedByUser: boolean;
}
