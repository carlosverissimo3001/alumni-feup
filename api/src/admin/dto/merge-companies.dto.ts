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

export class MergeCompaniesDto {
  @ApiProperty({
    type: [String],
    description: 'The company ids to merge',
    example: ['1', '2', '3'],
  })
  @IsOptional()
  @TransformToArray()
  @Transform(({ value }: { value: string | string[] }) => {
    if (Array.isArray(value)) {
      return value.filter((companyId: string) => companyId?.trim());
    }
    return value;
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  companyIds: string[];

  @ApiProperty({
    type: String,
    description: 'The company id to merge into',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  mergeIntoCompanyId: string;
}
