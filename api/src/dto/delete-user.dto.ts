import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserDto {
  @ApiProperty({ description: 'The id of the user to delete' })
  @IsString()
  @IsNotEmpty()
  id: string;
}
