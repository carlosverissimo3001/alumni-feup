import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SortBy } from '../utils/types';

export class QueryParamsDto {
  @ApiPropertyOptional({
    description: 'The start date of the query',
    example: '2021-01-01',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'The end date of the query',
    example: '2021-01-01',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'The course IDs to filter by',
    example: ['1', '2', '3'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  courseIds?: string[];

  @ApiPropertyOptional({
    description: 'The company IDs to filter by',
    example: ['1', '2', '3'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  companyIds?: string[];
  @ApiPropertyOptional({
    description: 'The graduation years to filter by',
    example: ['2021', '2022', '2023'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  graduationYears?: string[];

  @ApiPropertyOptional({
    description: 'The industry IDs to filter by',
    example: ['1', '2', '3'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industryIds?: string[];

  @ApiPropertyOptional({
    description: 'The location IDs to filter by',
    example: ['1', '2', '3'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locationIds?: string[];

  @ApiPropertyOptional({
    description: 'The countries to filter by',
    example: ['Portugal', 'Spain', 'France'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @ApiPropertyOptional({
    description: 'Filter for current roles only',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  currentRolesOnly?: boolean;

  @ApiProperty({
    description: 'The number of results to return',
    example: 10,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  limit: number;

  @ApiProperty({
    description: 'The offset of the query',
    example: 0,
    default: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  offset: number;

  @ApiPropertyOptional({
    description: 'Search query',
    example: 'search query',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search?: string;

  @ApiProperty({
    description: 'How to sort the results',
    default: SortBy.ALUMNI_COUNT,
    type: SortBy,
    enumName: 'SortBy',
  })
  @IsNotEmpty()
  @IsEnum(SortBy)
  sortBy: SortBy;

  @ApiProperty({
    description: 'The order of the results',
    example: 'asc',
    default: 'desc',
  })
  @IsNotEmpty()
  @IsString()
  sortOrder: 'asc' | 'desc';
  /* 
  TODO: Filter by ESCO title
  */
}
