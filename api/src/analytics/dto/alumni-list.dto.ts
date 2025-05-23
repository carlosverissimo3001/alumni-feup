import { LocationAnalyticsEntity } from '../entities';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class AlumniListItemDto {
  @ApiProperty({
    description: 'The alumni ID',
    type: String,
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'The full name of the alumni',
    type: String,
  })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({
    description: 'The linkedin url of the alumni',
    type: String,
  })
  @IsString()
  linkedinUrl?: string;

  @ApiPropertyOptional({
    description: 'The profile picture of the alumni',
    type: String,
  })
  @IsString()
  profilePictureUrl?: string;

  @ApiPropertyOptional({
    description: 'The location of the alumni`s current role',
    type: LocationAnalyticsEntity,
  })
  @IsObject()
  currentRoleLocation?: LocationAnalyticsEntity;
}

export class AlumniListResponseDto {
  @ApiProperty({ type: AlumniListItemDto, isArray: true })
  alumni: AlumniListItemDto[];

  @ApiProperty({
    description:
      'The total number of alumni in the database before applying the filters',
  })
  count: number;

  @ApiProperty({
    description:
      'The total number of alumni in the database after applying the filters',
  })
  filteredCount: number;
}
