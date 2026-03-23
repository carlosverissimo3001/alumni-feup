import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchUsersDto {
  @ApiProperty({
    description: 'Search query matched against alumni full name',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  q: string;
}

export class UserSearchResultDto {
  @ApiProperty({ description: 'Alumni ID' })
  id: string;

  @ApiProperty({ description: 'Full name' })
  fullName: string;

  @ApiPropertyOptional({ description: 'LinkedIn URL' })
  linkedinUrl?: string | null;
}
