import { Role } from './role.entity';
import { Graduation } from './graduation.entity';
import { LocationGeo } from './location.entity';
import { Source } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class Alumni {
  @ApiProperty({ description: 'The id of the alumni' })
  id: string;

  @ApiProperty({ description: 'The first name of the alumni' })
  firstName: string;

  @ApiProperty({ description: 'The last name of the alumni' })
  lastName: string;

  @ApiPropertyOptional({ description: 'The full name of the alumni' })
  fullName?: string | null;

  @ApiPropertyOptional({ description: 'The linkedin url of the alumni' })
  linkedinUrl?: string | null;

  @ApiPropertyOptional({ description: 'The profile picture of the alumni' })
  profilePictureUrl?: string | null;

  @ApiPropertyOptional({ description: 'The source of the alumni' })
  source?: Source | null;

  @ApiProperty({ description: 'Whether the alumni is in a group' })
  isInGroup: boolean;

  @ApiProperty({
    description: 'Whether the alumni has a sigarra match',
  })
  hasSigarraMatch: boolean;

  @ApiPropertyOptional({
    description: 'The roles of the alumni',
  })
  Roles?: Role[];

  @ApiPropertyOptional({ description: 'The current location of the alumni' })
  Location?: LocationGeo | null;

  @ApiPropertyOptional({
    description: 'The graduation status(es) of the alumni',
  })
  Graduations?: Graduation[];

  constructor(data: Alumni) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.linkedinUrl = data.linkedinUrl;
    this.Roles = data.Roles;
    this.Location = data.Location;
    this.Graduations = data.Graduations;
  }
}
