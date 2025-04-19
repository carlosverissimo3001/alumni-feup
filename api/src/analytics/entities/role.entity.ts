import { ApiProperty } from '@nestjs/swagger';

export class RoleAnalyticsEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  alumniId: string;
}
