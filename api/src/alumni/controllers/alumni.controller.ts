import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AlumniService } from '../services/alumni.service';
import { Alumni, GeoJSONFeatureCollection } from '@/entities';
import { CreateAlumniDto, GetGeoJSONDto } from '@/dto';

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

  @Get('geoJSON')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all alumni to be displayed in the map',
  })
  @ApiResponse({
    description: 'Returns all alumni to be displayed in the map',
    type: GeoJSONFeatureCollection,
  })
  async findAllGeoJSON(
    @Query() getGeoJSONDto: GetGeoJSONDto,
  ): Promise<GeoJSONFeatureCollection> {
    return this.alumniService.findAllGeoJSON(getGeoJSONDto);
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
  /* @ApiResponse({
    description: 'Returns the created alumni',
    type: Alumni | null,
  }) */
  async create(
    @Body() createAlumniDto: CreateAlumniDto,
  ): Promise<Alumni | null> {
    return this.alumniService.create(createAlumniDto);
  }
}
