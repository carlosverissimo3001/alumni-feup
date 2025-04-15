/* DTO returned on auth by the backend */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiProperty({
    description: 'The access token of the user',
  })
  access_token: string;

  @ApiProperty({
    description: 'The user object',
  })
  user: User;
}
