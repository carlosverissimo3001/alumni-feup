import { IsString, IsDate, IsOptional } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class Role {
  @ApiProperty({ description: 'The id of the role' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'The id of the alumni' })
  @IsString()
  alumni_id: string;

  @ApiProperty({ description: 'The id of the company' })
  @IsString()
  company_id: string;

  @ApiProperty({ description: 'The start date of the role' })
  @IsDate()
  @Type(() => Date)
  start_date: Date;

  @ApiProperty({
    description: 'The end date of the role',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  end_date?: Date | null;

  @ApiProperty({ description: 'The seniority level of the role' })
  @IsString()
  seniority_level: string;

  @ApiProperty({ description: 'The level 1 of the role' })
  @IsString()
  esco_l1: string;

  @ApiProperty({ description: 'The level 2 of the role' })
  @IsString()
  esco_l2: string;

  constructor(data: Role) {
    this.id = data.id;
    this.alumni_id = data.alumni_id;
    this.company_id = data.company_id;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.seniority_level = data.seniority_level;
    this.esco_l1 = data.esco_l1;
    this.esco_l2 = data.esco_l2;
  }
}
