import { ApiProperty } from '@nestjs/swagger';

export class BasicRoleDto {
  @ApiProperty({ description: 'The code of the role', type: String })
  code: string;

  @ApiProperty({ description: 'The title of the role', type: String })
  title: string;

  @ApiProperty({
    description: 'The number of roles with this title',
    type: String,
  })
  count: string;
}
