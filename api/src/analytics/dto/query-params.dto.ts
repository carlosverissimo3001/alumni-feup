import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { SortBy } from '../utils/types';
import {
  IsNotNullableOptional,
  toBoolean,
  TransformToArray,
} from '@/utils/validation';

export class QueryParamsDto {
  @ApiPropertyOptional({
    description: 'The start date of the query',
    example: '2023-11-16',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'The end date of the query',
    example: '2025-04-20',
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
  @TransformToArray()
  @Transform(({ value }: { value: string | string[] }) => {
    if (Array.isArray(value)) {
      return value.filter((course: string) => course?.trim());
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  courseIds?: string[];

  @ApiPropertyOptional({
    description: 'The company IDs to filter by',
    example: ['1', '2', '3'],
  })
  @IsOptional()
  @TransformToArray()
  @Transform(({ value }: { value: string | string[] }) => {
    if (Array.isArray(value)) {
      return value.filter((company: string) => company?.trim());
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  companyIds?: string[];

  @ApiPropertyOptional({
    description: 'The graduation years to filter by',
    example: ['2021', '2022', '2023'],
  })
  @IsOptional()
  @TransformToArray()
  @Transform(({ value }: { value: string | string[] }) => {
    if (Array.isArray(value)) {
      return value.filter((year: string) => year?.trim());
    }
    return value;
  })
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
    description: 'The countries to filter by',
    example: ['Portugal', 'Spain', 'France'],
  })
  @IsOptional()
  @TransformToArray()
  @Transform(({ value }: { value: string | string[] }) => {
    if (Array.isArray(value)) {
      return value.filter((country: string) => country?.trim());
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @ApiPropertyOptional({
    description: 'The cities to filter by',
    example: ['Porto', 'Paris', 'Bucharest'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cities?: string[];

  @ApiPropertyOptional({
    description: 'Filter for current roles only',
    type: 'boolean',
    example: true,
  })
  @IsNotNullableOptional()
  @IsBoolean()
  @Transform(({ obj }) => toBoolean(obj.currentRolesOnly))
  currentRolesOnly?: boolean = false;

  @ApiPropertyOptional({
    description: 'Whether to exclude roles in Portugal',
    type: 'boolean',
    example: true,
  })
  @IsNotNullableOptional()
  @IsBoolean()
  @Transform(({ obj }) => toBoolean(obj.onlyInternational))
  onlyInternational?: boolean = false;

  @ApiPropertyOptional({
    description: 'Exclude research and high education roles',
    example: true,
  })
  @IsNotNullableOptional()
  @IsBoolean()
  @Transform(({ obj }) => toBoolean(obj.excludeResearchAndHighEducation))
  excludeResearchAndHighEducation?: boolean = false;

  @ApiPropertyOptional({
    description: 'Search query for companies',
    example: 'search query',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  companySearch?: string;

  @ApiPropertyOptional({
    description: 'Search query for industries',
    example: 'search query',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  industrySearch?: string;

  @ApiPropertyOptional({
    description: 'The number of results to return',
    example: 10,
  })
  @IsOptional()
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    description: 'The offset of the query',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Broad search query',
    example: 'search query',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search?: string;

  @ApiPropertyOptional({
    description: 'How to sort the results',
    default: SortBy.ALUMNI_COUNT,
    type: SortBy,
    enumName: 'SortBy',
  })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;

  @ApiPropertyOptional({
    description: 'The order of the results',
    example: 'asc',
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
  /* 
  TODO: Filter by ESCO title
  */
}
