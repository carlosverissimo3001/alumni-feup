import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class FindInviteDto {
  @ApiProperty({ description: 'The email of the invite' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'The used status of the invite' })
  @IsOptional()
  @IsBoolean()
  used?: boolean;
}
