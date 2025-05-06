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
import { COMPANY_SIZE, COMPANY_TYPE } from '@prisma/client';

export class QueryParamsDto {
  /**
   * *** ROLE PARAMS ***
   */
  @ApiPropertyOptional({
    description: 'The start date of the role',
    example: '2023-11-16',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'The end date of the role',
    example: '2025-04-20',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  endDate?: string;

  /**
   * *** EDUCATION PARAMS ***
   */
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

  /**
   * *** COMPANY PARAMS ***
   */
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
    description: 'The industry IDs to filter by',
    example: ['1', '2', '3'],
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
    description: 'The cities ids to filter by',
    example: ['1', '2', '3'],
  })
  @IsOptional()
  @TransformToArray()
  @Transform(({ value }: { value: string | string[] }) => {
    if (Array.isArray(value)) {
      return value.filter((city: string) => city?.trim());
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  cityIds?: string[];

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
    description: 'The company sizes to filter by',
    example: [COMPANY_SIZE.A, COMPANY_SIZE.B],
    isArray: true,
    enum: COMPANY_SIZE,
    type: 'string',
  })
  @TransformToArray()
  @Transform(({ value }: { value: string | string[] }) => {
    if (Array.isArray(value)) {
      return value.filter((companySize: string) => companySize?.trim());
    }
    return value;
  })
  @IsOptional()
  @IsEnum(COMPANY_SIZE, { each: true })
  companySize?: COMPANY_SIZE[];

  @ApiPropertyOptional({
    description: 'The company types to filter by',
    example: [COMPANY_TYPE.PUBLIC_COMPANY, COMPANY_TYPE.PRIVATELY_HELD],
    isArray: true,
    enum: COMPANY_TYPE,
    type: 'string',
  })
  @TransformToArray()
  @Transform(({ value }: { value: string | string[] }) => {
    if (Array.isArray(value)) {
      return value.filter((companyType: string) => companyType?.trim());
    }
    return value;
  })
  @IsOptional()
  @IsEnum(COMPANY_TYPE, { each: true })
  companyType?: COMPANY_TYPE[];

  @ApiPropertyOptional({
    description: 'The ESCO codes to filter by',
    example: ['1', '2', '3'],
  })
  @IsOptional()
  @TransformToArray()
  @Transform(({ value }: { value: string | string[] }) => {
    if (Array.isArray(value)) {
      return value.filter((escoCode: string) => escoCode?.trim());
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  escoCodes?: string[];

  @ApiPropertyOptional({
    description: 'The classification level to filter by',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  classificationLevel?: number;

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
