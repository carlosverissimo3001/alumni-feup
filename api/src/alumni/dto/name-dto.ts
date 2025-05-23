import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class NameDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  fullName: string;
}
