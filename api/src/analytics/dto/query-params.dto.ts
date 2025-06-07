/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsEnum,
  Max,
  IsInt,
  Min,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { SORT_BY, SELECTOR_TYPE } from '../consts';
import {
  IsNotNullableOptional,
  toBoolean,
  TransformToArray,
} from '@/validators';
import { COMPANY_SIZE, COMPANY_TYPE, SENIORITY_LEVEL } from '@prisma/client';

class IncludeTrendDto {
  @ApiPropertyOptional({
    description: 'Whether to include the company trends data',
    example: true,
    type: 'boolean',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ obj }) => toBoolean(obj.includeCompanyTrend))
  includeCompanyTrend?: boolean = false;

  @ApiPropertyOptional({
    description: 'Whether to include the role trends data',
    example: true,
    type: 'boolean',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ obj }) => toBoolean(obj.includeRoleTrend))
  includeRoleTrend?: boolean = false;

  @ApiPropertyOptional({
    description: 'Whether to include the industry trends data',
    example: true,
    type: 'boolean',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ obj }) => toBoolean(obj.includeIndustryTrend))
  includeIndustryTrend?: boolean = false;

  @ApiPropertyOptional({
    description: 'Whether to include the education trends data',
    example: true,
    type: 'boolean',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ obj }) => toBoolean(obj.includeEducationTrend))
  includeEducationTrend?: boolean = false;

  @ApiPropertyOptional({
    description: 'Whether to include the seniority trends data',
    example: true,
    type: 'boolean',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ obj }) => toBoolean(obj.includeSeniorityTrend))
  includeSeniorityTrend?: boolean = false;

  @ApiPropertyOptional({
    description: 'Whether to include the geo trends data',
    example: true,
    type: 'boolean',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ obj }) => toBoolean(obj.includeGeoTrend))
  includeGeoTrend?: boolean = false;
}

export class QueryParamsDto extends IncludeTrendDto {
  @ApiPropertyOptional({
    description: 'The alumni IDs to filter by',
    example: ['1', '2', '3'],
  })
  @IsOptional()
  @TransformToArray()
  @Transform(({ value }: { value: string | string[] }) => {
    if (Array.isArray(value)) {
      return value.filter((alumniId: string) => alumniId?.trim());
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  alumniIds?: string[];

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
    description: 'The faculty IDs to filter by',
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
  facultyIds?: string[];

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

  /**
   * *** GEO PARAMS ***
   */

  @ApiPropertyOptional({
    description: 'The country codes where alumni exerced their roles',
    example: ['PT', 'ES', 'FR'],
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
  roleCountryCodes?: string[];

  @ApiPropertyOptional({
    description: 'The city IDS where alumni exerced their roles',
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
  roleCityIds?: string[];

  @ApiPropertyOptional({
    description: 'The company HQs country codes to filter by',
    example: ['PT', 'ES', 'FR'],
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
  companyHQsCountryCodes?: string[];

  @ApiPropertyOptional({
    description: 'The company HQs city ids to filter by',
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
  companyHQsCityIds?: string[];

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
    description: 'Include only companies with salary data',
    type: 'boolean',
    example: true,
  })
  @IsNotNullableOptional()
  @IsBoolean()
  @Transform(({ obj }) => toBoolean(obj.onlyCompaniesWithSalaryData))
  onlyCompaniesWithSalaryData?: boolean = false;

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
  alumniSearch?: string;

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
    description: 'The seniority levels to filter by',
    example: [SENIORITY_LEVEL.INTERN, SENIORITY_LEVEL.ENTRY_LEVEL],
    isArray: true,
    enum: SENIORITY_LEVEL,
    type: 'string',
  })
  @TransformToArray()
  @Transform(({ value }: { value: string | string[] }) => {
    if (Array.isArray(value)) {
      return value.filter((seniorityLevel: string) => seniorityLevel?.trim());
    }
    return value;
  })
  @IsOptional()
  @IsEnum(SENIORITY_LEVEL, { each: true })
  seniorityLevel?: SENIORITY_LEVEL[];

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
    description: 'The ESCO classification level to filter by',
    example: 5,
    default: 5,
  })
  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(8)
  @Type(() => Number)
  escoClassificationLevel?: number;

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
    default: SORT_BY.COUNT,
    type: 'string',
    enum: SORT_BY,
  })
  @IsOptional()
  @IsEnum(SORT_BY)
  sortBy?: SORT_BY;

  @ApiPropertyOptional({
    description: 'The type of analytics to fetch',
    default: SELECTOR_TYPE.ALL,
    type: 'string',
    enum: SELECTOR_TYPE,
  })
  @IsOptional()
  @IsEnum(SELECTOR_TYPE)
  selectorType?: SELECTOR_TYPE = SELECTOR_TYPE.ALL;

  @ApiPropertyOptional({
    description: 'The order of the results',
    example: 'asc',
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
