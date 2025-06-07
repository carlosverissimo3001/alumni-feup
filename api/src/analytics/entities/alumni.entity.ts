import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleAnalyticsEntity } from './role.entity';
import { GraduationAnalyticsEntity } from './graduation.entity';
import { LocationAnalyticsEntity } from './location.entity';

export class AlumniAnalyticsEntity {
  @ApiProperty({
    description: 'The id of the alumni',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'The full name of the alumni',
    type: String,
  })
  fullName: string;

  @ApiPropertyOptional({
    description: 'The linkedin url of the alumni',
    type: String,
  })
  linkedinUrl?: string;

  @ApiPropertyOptional({
    description: 'The profile picture of the alumni',
    type: String,
  })
  profilePictureUrl?: string;

  @ApiProperty({
    description: 'The roles of the alumni',
    type: RoleAnalyticsEntity,
    isArray: true,
  })
  roles: RoleAnalyticsEntity[];

  @ApiPropertyOptional({
    description: 'The graduations of the alumni',
    type: GraduationAnalyticsEntity,
    isArray: true,
  })
  graduations?: GraduationAnalyticsEntity[];

  @ApiPropertyOptional({
    description: 'The location of the alumni',
    type: LocationAnalyticsEntity,
  })
  location?: LocationAnalyticsEntity;
}
