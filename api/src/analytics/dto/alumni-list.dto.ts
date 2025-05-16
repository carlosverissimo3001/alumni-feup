import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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
    nullable: true,
  })
  @IsString()
  linkedinUrl: string | null;

  @ApiPropertyOptional({
    description: 'The profile picture of the alumni',
    type: String,
    nullable: true,
  })
  @IsString()
  profilePictureUrl: string | null;
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
