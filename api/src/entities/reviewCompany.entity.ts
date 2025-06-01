import { LocationGeo } from './location.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Company } from './company.entity';

export class ReviewCompany {
  @ApiProperty({ description: 'The id of the review' })
  id: string;

  @ApiProperty({ description: 'The review' })
  description: string | null;

  @ApiProperty({ description: 'The rating of the review' })
  rating: number;

  @ApiProperty({ description: 'upvotes fo the review' })
  upvotes: string[];

  @ApiProperty({ description: 'downvvotes of the review' })
  downvotes: string[];

  @ApiPropertyOptional({ description: 'The location of the review' })
  Location: LocationGeo | null;

  @ApiProperty({ description: 'The Company' })
  Company: Company;

  @ApiPropertyOptional({
    description: 'The date and time when the review was created',
    type: Date,
  })
  createdAt?: Date | null;

  @ApiPropertyOptional({
    description: 'The review anonymity',
    type: Boolean,
  })
  anonymous: Boolean;

  constructor(data: ReviewCompany) {
    this.id = data.id;
    this.description = data.description;
    this.rating = data.rating;
    this.upvotes = data.upvotes;
    this.downvotes = data.downvotes;
    this.Location = data.Location;
    this.Company = data.Company;
    this.createdAt = data.createdAt;
  }
}

export class ReviewCompanyExtended extends ReviewCompany {
  @ApiProperty({ description: 'The id of the location' })
  locationId: string | null;

  @ApiPropertyOptional({
    description: 'The date and time when the review was updated',
    type: Date,
  })
  updatedAt?: Date | null;

  constructor(data: ReviewCompanyExtended) {
    super(data);
    this.locationId = data.locationId;
    this.updatedAt = data.updatedAt;
  }
}
