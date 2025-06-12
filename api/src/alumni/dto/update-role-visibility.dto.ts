import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsBoolean } from 'class-validator';

export class UpdateRoleVisibilityDto {
  @ApiProperty({
    description: 'Whether the role should be hidden in the user profile',
    type: Boolean,
  })
  @IsBoolean()
  @IsNotEmpty()
  shouldHide: boolean;

  @ApiProperty({
    description: 'The role to update',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
