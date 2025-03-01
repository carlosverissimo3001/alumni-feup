import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from '@nestjs/class-validator';
import { GRADUATION_STATUS } from '@prisma/client';

export class Graduation {
  @ApiProperty({ description: 'The id of the graduation' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'The id of the alumni' })
  @IsString()
  alumni_id: string;

  @ApiProperty({ description: 'The id of the course' })
  @IsString()
  course_id: string;

  @ApiProperty({ description: 'The status of the graduation' })
  @IsString()
  status: GRADUATION_STATUS;

  @ApiProperty({ description: 'The conclusion year of the graduation' })
  @IsOptional()
  @IsInt()
  conclusion_year?: number;
}
