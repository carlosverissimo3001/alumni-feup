import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobClassification } from './job-classification.entity';
import { LocationGeo } from './location.entity';
import { Company } from './company.entity';
import { SENIORITY_LEVEL } from '@prisma/client';

export class Role {
  @ApiProperty({ description: 'The id of the role' })
  id: string;

  @ApiProperty({ description: 'The start date of the role' })
  startDate: Date;

  @ApiPropertyOptional({ description: 'The end date of the role' })
  endDate?: Date | null;

  @ApiProperty({
    description: 'The seniority level of the role',
    enum: SENIORITY_LEVEL,
  })
  seniorityLevel: SENIORITY_LEVEL;

  @ApiProperty({ description: 'The Company' })
  Company: Company;

  @ApiPropertyOptional({ description: 'The job classifications' })
  JobClassification?: JobClassification | null;

  @ApiPropertyOptional({ description: 'The location of the role' })
  Location?: LocationGeo | null;

  constructor(data: Role) {
    this.id = data.id;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.seniorityLevel = data.seniorityLevel;
    this.JobClassification = data.JobClassification;
    this.Location = data.Location;
  }
}

export class RoleExtended extends Role {
  @ApiProperty({ description: 'The id of the alumni' })
  alumniId: string;

  @ApiProperty({ description: 'The id of the company' })
  companyId: string;

  @ApiProperty({ description: 'The id of the location' })
  locationId: string;

  constructor(data: RoleExtended) {
    super(data);
    this.alumniId = data.alumniId;
    this.companyId = data.companyId;
    this.locationId = data.locationId;
  }
}
