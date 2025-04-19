import { ApiProperty } from '@nestjs/swagger';
//import { LocationAnalyticsEntity } from './location.entity';

export class RoleAnalyticsEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  alumniId: string;

  /* @ApiProperty()
  location: LocationAnalyticsEntity; */
}
