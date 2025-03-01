import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AlumniService } from '../services/alumni.service';
import { Alumni } from 'src/entities/alumni.entity';
import { Param, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAlumniDto } from '../../dto/create-alumni.dto';

@ApiTags('V1', 'Alumni')
@Controller('alumni')
export class AlumniController {
  constructor(private readonly alumniService: AlumniService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all alumni, enriched with location, graduations and roles',
  })
  @ApiResponse({
    description: 'Returns all alumni',
    type: [Alumni],
  })
  async findAll(): Promise<Alumni[]> {
    return this.alumniService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get alumni by id, enriched with location, graduations and roles',
  })
  @ApiResponse({
    description:
      'Returns the alumni with the given id, enriched with location, graduations and roles',
    type: Alumni,
  })
  async findOne(@Param('id') id: string): Promise<Alumni> {
    return this.alumniService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new alumni' })
  @ApiResponse({
    description: 'Returns the created alumni',
    type: Alumni,
  })
  async create(@Body() createAlumniDto: CreateAlumniDto): Promise<Alumni> {
    return this.alumniService.create(createAlumniDto);
  }
}
