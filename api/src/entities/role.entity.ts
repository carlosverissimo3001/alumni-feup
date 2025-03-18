import { IsString, IsDate, IsOptional } from '@nestjs/class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { JobClassification } from './job-classification.entity';
import { LocationGeo } from './location.entity';

export class Role {
  @ApiProperty({ description: 'The id of the role' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'The start date of the role' })
  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @ApiPropertyOptional({ description: 'The end date of the role' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  end_date?: Date | null;

  @ApiProperty({ description: 'The seniority level of the role' })
  @IsString()
  seniority_level: string;

  @ApiProperty({ description: 'The job classifications' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobClassification)
  JobClassification: JobClassification[];

  @ApiPropertyOptional({ description: 'The location of the role' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationGeo)
  Location?: LocationGeo | null;

  constructor(data: Role) {
    this.id = data.id;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.seniority_level = data.seniority_level;
    this.JobClassification = data.JobClassification;
    this.Location = data.Location;
  }
}

export class RoleExtended extends Role {
  @ApiProperty({ description: 'The id of the alumni' })
  @IsString()
  alumni_id: string;

  @ApiProperty({ description: 'The id of the company' })
  @IsString()
  company_id: string;

  @ApiProperty({ description: 'The id of the location' })
  @IsString()
  location_id: string;

  constructor(data: RoleExtended) {
    super(data);
    this.alumni_id = data.alumni_id;
    this.company_id = data.company_id;
    this.location_id = data.location_id;
  }
}
