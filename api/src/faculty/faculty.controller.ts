import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '@nestjs/swagger';
import { Faculty } from '@/entities/faculty.entity';

@ApiTags('V1', 'Faculty')
@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all faculties' })
  @ApiResponse({
    description: 'Returns all faculties',
    type: Faculty,
    isArray: true,
  })
  async findAll(): Promise<Faculty[]> {
    return this.facultyService.findAll();
  }
}
