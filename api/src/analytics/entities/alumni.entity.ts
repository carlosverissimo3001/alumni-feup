import { ApiProperty } from '@nestjs/swagger';
import { RoleAnalyticsEntity } from './role.entity';
import { GraduationAnalyticsEntity } from './graduation.entity';

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

  @ApiProperty({
    description: 'The linkedin url of the alumni',
    type: String,
    nullable: true,
  })
  linkedinUrl: string | null;

  @ApiProperty({
    description: 'The profile picture of the alumni',
    type: String,
    nullable: true,
  })
  profilePictureUrl: string | null;

  @ApiProperty({
    description: 'The roles of the alumni',
    type: RoleAnalyticsEntity,
    isArray: true,
  })
  roles: RoleAnalyticsEntity[];

  @ApiProperty({
    description: 'The graduations of the alumni',
    type: GraduationAnalyticsEntity,
    isArray: true,
  })
  graduations: GraduationAnalyticsEntity[];
}
