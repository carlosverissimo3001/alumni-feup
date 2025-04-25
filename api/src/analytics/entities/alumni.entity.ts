import { ApiProperty } from '@nestjs/swagger';
import { RoleAnalyticsEntity } from './role.entity';

export class AlumniAnalyticsEntity {
  @ApiProperty({
    description: 'The id of the alumni',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'The roles of the alumni',
    type: RoleAnalyticsEntity,
    isArray: true,
  })
  roles: RoleAnalyticsEntity[];
}
