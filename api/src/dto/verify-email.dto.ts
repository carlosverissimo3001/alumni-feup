import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class VerifyEmailDto {
  @ApiProperty({
    description: 'The email of the alumni',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyEmailTokenDto extends VerifyEmailDto {
  @ApiProperty({
    description: 'The OTP token of the alumni',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
