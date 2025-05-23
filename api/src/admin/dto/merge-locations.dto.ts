import { TransformToArray } from '@/validators';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class MergeLocationsDto {
  @ApiProperty({
    type: [String],
    description: 'The location ids to merge',
    example: ['1', '2', '3'],
  })
  @IsOptional()
  @TransformToArray()
  @Transform(({ value }: { value: string | string[] }) => {
    if (Array.isArray(value)) {
      return value.filter((locationId: string) => locationId?.trim());
    }
    return value;
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  locationIds: string[];

  @ApiProperty({
    type: String,
    description: 'The location id to merge into',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  mergeIntoLocationId: string;
}
