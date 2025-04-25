import { IsOptional, IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransformToArray } from '@/utils/validation';

export class GetCitiesDto {
  @ApiPropertyOptional({
    description: 'The country codes  to filter by',
    example: ['PT', 'ES', 'FR'],
  })
  @IsOptional()
  @TransformToArray()
  @Transform(({ value }: { value: string | string[] }) => {
    if (Array.isArray(value)) {
      return value.filter((countryCode: string) => countryCode?.trim());
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  countryCodes?: string[];
}
