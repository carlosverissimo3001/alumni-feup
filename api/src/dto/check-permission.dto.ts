import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CheckPermissionDto {
  @ApiProperty({
    description: 'The ID of the user to check permission for',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The resource to check permission for',
    example: 'read',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({
    description: 'The action to check permission for',
    example: 'read',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  action: string;
}
