import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UpsertPermissionDto {
  @ApiProperty({
    description: 'The ID of the alumni to assign permissions to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The resource the permission applies to',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({
    description: 'The actions to grant on the resource',
    example: ['read', 'write'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  actions: string[];
}
