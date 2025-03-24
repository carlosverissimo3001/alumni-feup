import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsArray, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { GROUP_BY } from '@/consts';

export class GetGeoJSONDto {
  @ApiProperty({
    description: 'How to group the data',
    example: GROUP_BY.COUNTRIES,
    enum: GROUP_BY,
  })
  @IsEnum(GROUP_BY)
  groupBy: GROUP_BY;

  @ApiPropertyOptional({
    description: 'The ID(s) of the course(s)',
    example: ['abcdef-123456-7890-1234567890'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  @Transform(
    ({ value }) =>
      (!value ? [] : Array.isArray(value) ? value : [value]) as string[],
  )
  courseIds?: string[];

  @ApiPropertyOptional({
    description: 'The year(s) of conclusion(s)',
    example: [2023, 2024],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) =>
    !value ? [] : Array.isArray(value) ? value.map(Number) : [Number(value)],
  )
  conclusionYears?: number[];

  @ApiPropertyOptional({
    description: 'The selected year',
    example: 2023,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  selectedYear?: number;
}
