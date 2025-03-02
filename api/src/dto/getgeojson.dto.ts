import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsArray, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetGeoJSONDto {
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
}
