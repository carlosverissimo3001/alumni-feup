import { ApiProperty } from '@nestjs/swagger';

export class InviteEntity {
  @ApiProperty({ description: 'The email of the invite' })
  email: string;

  @ApiProperty({ description: 'The number of times the invite has been used' })
  usedCount: number;

  @ApiProperty({ description: 'The date the invite was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date the invite was updated' })
  updatedAt: Date;
}
