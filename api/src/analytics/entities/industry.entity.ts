import { ApiProperty } from '@nestjs/swagger';

export class IndustryAnalyticsEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}
