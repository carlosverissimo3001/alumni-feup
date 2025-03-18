import {
  IsString,
  IsOptional,
  IsUrl,
  IsArray,
  ValidateNested,
} from '@nestjs/class-validator';
import { Role } from './role.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Graduation } from './graduation.entity';
import { LocationGeo } from './location.entity';

export class Alumni {
  @ApiProperty({ description: 'The id of the alumni' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'The first name of the alumni' })
  @IsString()
  first_name: string;

  @ApiProperty({ description: 'The last name of the alumni' })
  @IsString()
  last_name: string;

  @ApiPropertyOptional({ description: 'The linkedin url of the alumni' })
  @IsOptional()
  @IsUrl()
  linkedin_url?: string;

  @ApiPropertyOptional({ description: 'The profile picture of the alumni' })
  @IsOptional()
  @IsUrl()
  profile_picture_url?: string | null;

  @ApiPropertyOptional({
    description: 'The roles of the alumni',
    type: () => [Role],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Role)
  Roles?: Role[];

  @ApiPropertyOptional({ description: 'The current location of the alumni' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationGeo)
  Location?: LocationGeo | null;

  @ApiPropertyOptional({
    description: 'The graduation status(es) of the alumni',
    type: () => [Graduation],
    required: false,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Graduation)
  Graduations?: Graduation[];

  constructor(data: Alumni) {
    this.id = data.id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.linkedin_url = data.linkedin_url;
    this.Roles = data.Roles;
    this.Location = data.Location;
    this.Graduations = data.Graduations;
  }
}
