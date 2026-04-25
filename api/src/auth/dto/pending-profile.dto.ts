import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PendingProfileDto {
  @ApiProperty({ description: 'LinkedIn person ID (sub claim)' })
  personId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  personalEmail?: string;

  @ApiPropertyOptional()
  profilePictureUrl?: string;
}
