import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class InviteUserDto {
  @ApiProperty({
    description: 'The email of the user to invite',
    example: 'test@example.com',
  })
  @IsEmail()
  readonly email: string;
}
