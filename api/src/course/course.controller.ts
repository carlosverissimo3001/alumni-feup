import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { Course } from '@entities';
import { FindCoursesDto } from '@/dto/find-courses.dto';

@ApiTags('V1', 'Course')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get courses' })
  @ApiResponse({
    description: 'Returns courses',
    type: Course,
    isArray: true,
  })
  async find(@Query() params: FindCoursesDto): Promise<Course[]> {
    return this.courseService.find(params);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a course by id' })
  @ApiResponse({ description: 'Returns a course', type: Course })
  async findOne(@Param('id') id: string): Promise<Course> {
    return this.courseService.findOne(id);
  }
}

export default CourseController;
