import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetRoleHierarchyDto {
  @ApiProperty({
    description: 'The ESCO code of the role',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
