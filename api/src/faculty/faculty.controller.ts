import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Body,
} from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '@nestjs/swagger';
import { Faculty } from '@/entities/faculty.entity';
import { AddFacultyDto } from '@/dto';
import { RequirePermission } from '@/auth/user-auth.guard';
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a faculty' })
  @ApiResponse({
    description: 'Returns the created faculty',
    type: Faculty,
  })
  @RequirePermission('admin', 'write')
  async create(@Body() addFacultyDto: AddFacultyDto): Promise<Faculty> {
    return this.facultyService.create(addFacultyDto);
  }
}
