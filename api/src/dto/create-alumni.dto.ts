import { IsOptional } from '@nestjs/class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAlumniDto {
  @ApiProperty({
    description: 'The first name of the alumni',
    example: 'John',
  })
  first_name: string;

  @ApiProperty({
    description: 'The last name of the alumni',
    example: 'Doe',
  })
  last_name: string;

  @ApiProperty({
    description: 'The LinkedIn URL of the alumni',
    example: 'https://www.linkedin.com/in/john-doe/',
  })
  linkedin_url: string;

  @ApiPropertyOptional({
    description: 'The institutional email of the alumni',
    example: 'john.doe@stanford.edu',
  })
  @IsOptional()
  institutional_email: string;

  @ApiPropertyOptional({
    description: 'The personal email of the alumni',
    example: 'john.doe@gmail.com',
  })
  @IsOptional()
  personal_email: string;

  @ApiPropertyOptional({
    description: 'Application specific person ID',
    example: 'v_n1dAL1gO',
  })
  @IsOptional()
  person_id?: string;
}
