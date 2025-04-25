import { TransformToArray } from '@/utils/validation';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsArray, IsString } from 'class-validator';

export class FindCoursesDto {
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
