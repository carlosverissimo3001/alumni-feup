import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
export class LinkedinConfirmDto {
  @ApiProperty({
    description: 'The LinkedIn URL of the user',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  linkedinUrl: string;

  @ApiProperty({
    description: 'The person ID of the user',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  personId: string;
}
