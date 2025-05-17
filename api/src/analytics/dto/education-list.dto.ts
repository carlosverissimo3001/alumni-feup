import { ApiProperty } from '@nestjs/swagger';
import { DataPointDto } from './data-point.dto';

export class GraduationListItemDto {
  @ApiProperty({
    description: 'Randomly generated ID for the graduation',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'For viz purposes',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'The year of graduation',
    type: Number,
  })
  year: number;

  @ApiProperty({
    description: 'The major acronym',
  })
  acronym: string;

  @ApiProperty({
    description:
      'The number of alumni that graduated from the major in the year',
    type: Number,
  })
  count: number;
}

export class GraduationListDto {
  @ApiProperty({
    description: 'The graduation list',
    type: GraduationListItemDto,
    isArray: true,
  })
  graduations: GraduationListItemDto[];

  @ApiProperty({
    description: 'The number of graduations',
  })
  count: number;

  @ApiProperty({
    description: 'The number of graduations, after applying the filters',
  })
  filteredCount: number;
}

export class MajorListItemDto {
  @ApiProperty({
    description: 'The major ID',
  })
  id: string;

  @ApiProperty({
    description: 'The major name',
  })
  name: string;

  @ApiProperty({
    description: 'The major acronym',
  })
  acronym: string;

  @ApiProperty({
    description: 'The faculty acronym',
  })
  facultyAcronym: string;

  @ApiProperty({
    description: 'The number of alumni that graduated from the major',
  })
  count: number;

  @ApiProperty({
    description: 'The alumni count trend of the country',
    type: DataPointDto,
    isArray: true,
  })
  trend: DataPointDto[];
}

export class MajorListDto {
  @ApiProperty({
    description: 'The major list',
    type: MajorListItemDto,
    isArray: true,
  })
  majors: MajorListItemDto[];

  @ApiProperty({
    description: 'The number of majors',
  })
  count: number;

  @ApiProperty({
    description: 'The number of majors, after applying the filters',
  })
  filteredCount: number;
}

export class FacultyListItemDto {
  @ApiProperty({
    description: 'The faculty ID',
  })
  id: string;

  @ApiProperty({
    description: 'The faculty name',
  })
  name: string;

  @ApiProperty({
    description: 'The faculty acronym',
  })
  acronym: string;

  @ApiProperty({
    description: 'The graduations trend of the faculty',
    type: DataPointDto,
    isArray: true,
  })
  trend: DataPointDto[];

  @ApiProperty({
    description: 'The number of alumni that graduated from the faculty',
  })
  count: number;
}

export class FacultyListDto {
  @ApiProperty({
    description: 'The faculty list',
    type: FacultyListItemDto,
    isArray: true,
  })
  faculties: FacultyListItemDto[];

  @ApiProperty({
    description: 'The number of faculties, after applying the filters',
  })
  filteredCount: number;

  @ApiProperty({
    description: 'The total number of faculties, regardless of filters',
  })
  count: number;
}
