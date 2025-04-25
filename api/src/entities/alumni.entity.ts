import { Role } from './role.entity';
import { Graduation } from './graduation.entity';
import { LocationGeo } from './location.entity';
import { Source } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { ReviewCompany } from './reviewCompany.entity';
import { ReviewLocation } from './reviewLocation.entity';

export class Alumni {
  @ApiProperty({ description: 'The id of the alumni' })
  id: string;

  @ApiProperty({ description: 'The first name of the alumni' })
  firstName: string;

  @ApiProperty({ description: 'The last name of the alumni' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'The full name of the alumni',
    type: String,
  })
  @IsOptional()
  @IsString()
  fullName?: string | null;

  @ApiPropertyOptional({
    description: 'The linkedin url of the alumni',
    type: String,
  })
  @IsOptional()
  @IsString()
  linkedinUrl?: string | null;

  @ApiPropertyOptional({
    description: 'The profile picture of the alumni',
    type: String,
  })
  @IsOptional()
  @IsString()
  profilePictureUrl?: string | null;

  @ApiPropertyOptional({
    description: 'The source of the alumni',
    enum: Source,
  })
  source?: Source | null;

  @ApiPropertyOptional({
    description: 'The roles of the alumni',
    type: Role,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  Roles?: Role[];

  @ApiPropertyOptional({
    description: 'The reviews of the alumni',
    type: [ReviewCompany],
  })
  @IsOptional()
  @IsArray()
  ReviewsCompany?: ReviewCompany[];

  @ApiPropertyOptional({
    description: '',
    type: [ReviewLocation],
  })
  @IsOptional()
  @IsArray()
  ReviewsLocation?: ReviewLocation[];

  @ApiPropertyOptional({
    description: 'The current location of the alumni',
    type: LocationGeo,
  })
  @IsOptional()
  Location?: LocationGeo | null;

  @ApiPropertyOptional({
    description: 'The graduation status(es) of the alumni',
    type: Graduation,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  Graduations?: Graduation[];

  constructor(data: Alumni) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.linkedinUrl = data.linkedinUrl;
    this.Roles = data.Roles;
    this.Location = data.Location;
    this.Graduations = data.Graduations;
  }
}

export class AlumniExtended extends Alumni {
  @ApiPropertyOptional({
    description: 'Whether the alumni is in a group',
    type: Boolean,
  })
  isInGroup?: boolean | null;

  @ApiPropertyOptional({
    description: 'Whether the alumni has a sigarra match',
    type: Boolean,
  })
  hasSigarraMatch?: boolean | null;

  @ApiPropertyOptional({
    description: 'Whether the alumni submission has been reviewed by the admin',
    type: Boolean,
  })
  wasReviewed?: boolean | null;

  @ApiPropertyOptional({
    description: 'The date and time the alumni submission was created',
    type: Date,
  })
  createdAt?: Date | null;

  @ApiPropertyOptional({
    description: 'The date and time the alumni submission was updated',
    type: Date,
  })
  updatedAt?: Date | null;

  constructor(data: AlumniExtended) {
    super(data);
    this.isInGroup = data.isInGroup;
    this.hasSigarraMatch = data.hasSigarraMatch;
    this.wasReviewed = data.wasReviewed;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
