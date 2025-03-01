import {
  IsString,
  IsOptional,
  IsUrl,
  IsArray,
  ValidateNested,
} from '@nestjs/class-validator';
import { Role } from './role.entity';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
export class Company {
  @ApiProperty({ description: 'The id of the company' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'The name of the company' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The linkedin url of the company' })
  @IsOptional()
  @IsUrl()
  linkedin_url?: string | null;

  @ApiProperty({
    description: 'The roles of the company',
    type: () => [Role],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Role)
  roles?: Role[];

  constructor(data: Company) {
    this.id = data.id;
    this.name = data.name;
    this.linkedin_url = data.linkedin_url;
  }
}
