import { Role } from './role.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Company {
  @ApiProperty({ description: 'The id of the company' })
  id: string;

  @ApiProperty({ description: 'The name of the company' })
  name: string;

  @ApiPropertyOptional({ description: 'The linkedin url of the company' })
  linkedinUrl?: string | null;

  @ApiProperty({
    description: 'The roles of the company',
  })
  Role?: Role[];

  constructor(data: Company) {
    this.id = data.id;
    this.name = data.name;
    this.linkedinUrl = data.linkedinUrl;
  }
}
