import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CourseExtended } from '@entities'

@ApiTags('V1', 'Course')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ description: 'Returns all courses', type: [CourseExtended] })
  async findAll(): Promise<CourseExtended[]> {
    return this.courseService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a course by id' })
  @ApiResponse({ description: 'Returns a course', type: CourseExtended })
  async findOne(@Param('id') id: string): Promise<CourseExtended> {
    return this.courseService.findOne(id);
  }
}

export default CourseController;
