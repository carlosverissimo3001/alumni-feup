import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../consts/enum';

class User {
  @ApiProperty({
    description: 'The ID of the user',
  })
  id: string;

  @ApiProperty({
    description: 'The first name of the user',
  })
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'The profile picture URL of the user',
    type: String,
  })
  profilePictureUrl?: string | null;
}

export class UserAuthResponse {
  @ApiPropertyOptional({
    description: 'The access token of the user',
    type: 'string',
    nullable: true,
  })
  access_token?: string;

  @ApiPropertyOptional({
    description: 'The user object',
    type: User,
    nullable: true,
  })
  user?: User;

  @ApiProperty({
    description: 'The status of the user',
    type: 'string',
    enum: UserStatus,
  })
  status: UserStatus;

  @ApiPropertyOptional({
    description: 'The person ID of the user',
    type: 'string',
    nullable: true,
  })
  personId?: string;
}
