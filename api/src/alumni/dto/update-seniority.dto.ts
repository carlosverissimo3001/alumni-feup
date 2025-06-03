import { ApiProperty } from '@nestjs/swagger';
import { SENIORITY_LEVEL } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateSeniorityLevelDto {
  @ApiProperty({
    description: 'The new seniority level',
    example: SENIORITY_LEVEL.INTERN,
    enum: SENIORITY_LEVEL,
    type: 'string',
  })
  @IsEnum(SENIORITY_LEVEL)
  @IsNotEmpty()
  seniorityLevel: SENIORITY_LEVEL;
}
