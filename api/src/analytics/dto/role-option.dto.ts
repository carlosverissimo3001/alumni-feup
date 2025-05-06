import { ApiProperty } from '@nestjs/swagger';

export class RoleOptionDto {
  @ApiProperty({
    description: 'The ESCO code of the role',
    example: '2512',
    type: String,
  })
  escoCode: string;

  @ApiProperty({
    description: 'The title of the role',
    example: 'Software Engineer',
    type: String,
  })
  title: string;

  @ApiProperty({
    description: 'The classification level of the role',
    example: 1,
    type: Number,
  })
  level: number;
}
