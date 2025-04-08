import { IsString, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class MarkAsReviewedDto {
  @ApiProperty({ description: 'The id of the alumni to mark as reviewed' })
  @IsString()
  @IsNotEmpty()
  id: string;
}
