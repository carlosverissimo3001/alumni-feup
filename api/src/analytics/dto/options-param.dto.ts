import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { SELECTOR_TYPE } from '../consts';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TransformToArray } from '@/validators';

export class OptionsParamDto {
  @ApiProperty({
    description: 'The type of selector to get options for',
    type: String,
    enum: SELECTOR_TYPE,
  })
  @IsEnum(SELECTOR_TYPE)
  @IsNotEmpty()
  selectorType: SELECTOR_TYPE;

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

  @ApiPropertyOptional({
    description: 'The courses to filter by',
    example: ['123', '456', '768'],
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
    description: 'The faculties to filter by',
    example: ['123', '456', '768'],
  })
  @IsOptional()
  @TransformToArray()
  @Transform(({ value }: { value: string | string[] }) => {
    if (Array.isArray(value)) {
      return value.filter((faculty: string) => faculty?.trim());
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  facultyIds?: string[];
}
