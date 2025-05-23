import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  ValidateIf,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { COURSE_STATUS, COURSE_TYPE } from '@prisma/client';

@ValidatorConstraint({ name: 'isGreaterThanStartYear', async: false })
export class IsGreaterThanStartYearConstraint
  implements ValidatorConstraintInterface
{
  validate(value: number, args: ValidationArguments) {
    const object = args.object as CreateCourseDto;
    return value > object.startYear;
  }

  defaultMessage() {
    return 'End year must be greater than start year';
  }
}

export class CreateCourseDto {
  @ApiProperty({
    description: 'The name of the course',
    example: 'Computer Science',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'The international name of the course',
    example: 'Computer Science',
  })
  @IsString()
  @IsOptional()
  nameInt?: string;

  @ApiProperty({
    description: 'The acronym of the course',
    example: 'CS',
  })
  @IsString()
  @IsNotEmpty()
  acronym: string;

  @ApiProperty({
    description: 'The type of the course',
    example: COURSE_TYPE.BACHELORS,
    enum: COURSE_TYPE,
  })
  @IsEnum(COURSE_TYPE)
  @IsNotEmpty()
  courseType: COURSE_TYPE;

  @ApiProperty({
    description: 'The status of the course',
    example: COURSE_STATUS.ACTIVE,
    enum: COURSE_STATUS,
  })
  @IsEnum(COURSE_STATUS)
  @IsNotEmpty()
  status: COURSE_STATUS;

  @ApiProperty({
    description: 'The faculty id of the course',
    example: '123',
  })
  @IsString()
  @IsNotEmpty()
  facultyId: string;

  @ApiProperty({
    description: 'The start year of the course',
    example: 2020,
  })
  @IsInt()
  startYear: number;

  @ApiPropertyOptional({
    description: 'If the course is INACTIVE, the end year of the course',
    example: 2024,
  })
  @ValidateIf(
    (object: CreateCourseDto) => object.status === COURSE_STATUS.INACTIVE,
  )
  @IsOptional()
  @IsInt()
  @Min(1950, { message: 'End year must be at least 1950' })
  @ValidateIf(
    (object: CreateCourseDto) =>
      object.endYear !== undefined && object.startYear !== undefined,
  )
  @Validate(IsGreaterThanStartYearConstraint)
  endYear?: number;

  @ApiPropertyOptional({
    description: 'The created by of the course',
    example: '123',
  })
  @IsString()
  @IsOptional()
  createdBy?: string;
}
