import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddFacultyDto {
  @ApiProperty({
    description: 'The name of the faculty',
    example: 'Faculty of Science',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The acronym of the faculty',
    example: 'FCT',
  })
  @IsString()
  @IsNotEmpty()
  acronym: string;

  @ApiProperty({
    description: 'The international name of the faculty',
    example: 'Faculty of Science',
  })
  @IsString()
  @IsNotEmpty()
  nameInt: string;

  @ApiPropertyOptional({
    description: 'The created by of the faculty',
    example: '123',
  })
  @IsString()
  @IsOptional()
  createdBy?: string;
}
