import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Post,
  Body,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto, FindCoursesDto } from '@/dto';
import { RequirePermission } from '@/auth/user-auth.guard';
import { CourseAnalyticsEntity as CourseEntity } from '@/analytics/entities';
@ApiTags('V1', 'Course')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get courses' })
  @ApiResponse({
    description: 'Returns courses',
    type: CourseEntity,
    isArray: true,
  })
  async find(@Query() params: FindCoursesDto): Promise<CourseEntity[]> {
    return this.courseService.find(params);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a course by id' })
  @ApiResponse({ description: 'Returns a course', type: CourseEntity })
  async findOne(@Param('id') id: string): Promise<CourseEntity> {
    return this.courseService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a course' })
  @ApiResponse({
    description: 'Returns the created course',
    type: CourseEntity,
  })
  @RequirePermission('admin', 'write')
  async create(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<CourseEntity> {
    return this.courseService.create(createCourseDto);
  }
}

export default CourseController;
