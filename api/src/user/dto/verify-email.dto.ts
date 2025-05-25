/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { toBoolean } from '@/validators/toBoolean';
import { IsNotNullableOptional } from '@/validators';
import { Transform } from 'class-transformer';

export class VerifyEmailDto {
  @ApiProperty({ description: 'The email of the alumni' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Whether the request is part of the invite-only flow',
  })
  @IsNotNullableOptional()
  @IsBoolean()
  @Transform(({ obj }) => toBoolean(obj.isInviteFlow))
  isInviteFlow?: boolean = false;
}
export class VerifyEmailTokenDto extends VerifyEmailDto {
  @ApiProperty({
    description: 'The OTP token of the alumni',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
