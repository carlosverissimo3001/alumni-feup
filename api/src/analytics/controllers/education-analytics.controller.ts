import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import {
  QueryParamsDto,
  FacultyListDto,
  GraduationListDto,
  MajorListDto,
} from '@/analytics/dto';
import { EducationAnalyticsService } from '@/analytics/services';

@ApiTags('V1')
@Controller('analytics/education')
export class EducationAnalyticsController {
  constructor(
    private readonly educationAnalyticsService: EducationAnalyticsService,
  ) {}

  @Get('/faculties')
  @ApiOperation({
    summary:
      'Gets the faculties, and the number of alumni graduated from them.',
  })
  @ApiResponse({
    status: 200,
    description: 'The faculties with the number of alumni graduated from them.',
    type: FacultyListDto,
  })
  async getFaculties(@Query() query: QueryParamsDto) {
    return this.educationAnalyticsService.getFaculties(query);
  }

  @Get('/majors')
  @ApiOperation({
    summary: 'Get the majors, and the number of alumni graduated from them.',
  })
  @ApiResponse({
    status: 200,
    description: 'The majors with the number of alumni graduated from them.',
    type: MajorListDto,
  })
  async getMajors(@Query() query: QueryParamsDto) {
    return this.educationAnalyticsService.getMajors(query);
  }

  @Get('/graduations')
  @ApiOperation({
    summary:
      'Get the graduations, and the number of alumni graduated from them.',
  })
  @ApiResponse({
    status: 200,
    description:
      'The graduations with the number of alumni graduated from them.',
    type: GraduationListDto,
  })
  async getGraduations(@Query() query: QueryParamsDto) {
    return this.educationAnalyticsService.getGraduations(query);
  }
}
