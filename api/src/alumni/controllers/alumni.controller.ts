import { Alumni, GeoJSONFeatureCollection } from '@/entities';
import { AlumniExtended } from '@/entities/alumni.entity';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAlumniDto, GetGeoJSONDto, MarkAsReviewedDto } from '../dto';
import {
  AlumniPastLocationsAndCompaniesDto,
  BasicAlumniProfileDto,
} from '../dto/basic-alumni-profile.dto';
import { AlumniProfileService } from '../services/alumni-profile.service';
import { AlumniService } from '../services/alumni.service';

@ApiTags('V1', 'Alumni')
@Controller('alumni')
export class AlumniController {
  constructor(
    private readonly alumniService: AlumniService,
    private readonly alumniProfileService: AlumniProfileService,
  ) {}

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

  @Get('review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all alumni submissions that need to be reviewed',
  })
  @ApiResponse({
    description: 'Returns all alumni submissions that need to be reviewed',
    type: [AlumniExtended],
  })
  async getAlumniToReview(): Promise<AlumniExtended[]> {
    return this.alumniService.getAlumniToReview();
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

  @Post('review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark an alumni as reviewed',
  })
  @ApiResponse({
    description: 'Returns the alumni marked as reviewed',
    type: Alumni,
  })
  async markAsReviewed(@Body() body: MarkAsReviewedDto): Promise<Alumni> {
    return this.alumniService.markAsReviewed(body.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new alumni' })
  @ApiResponse({
    description: 'Returns the created alumni',
    type: Alumni,
  })
  async create(
    @Body() createAlumniDto: CreateAlumniDto,
  ): Promise<Alumni | null> {
    return this.alumniService.create(createAlumniDto);
  }

  @Get('basic-profile/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get basic profile of an alumni' })
  @ApiResponse({
    description: 'Returns the basic profile of an alumni',
    type: BasicAlumniProfileDto,
  })
  async getBasicProfile(
    @Param('id') id: string,
  ): Promise<BasicAlumniProfileDto> {
    return this.alumniProfileService.getBasicProfile(id);
  }

  @Get('past-locations-companies/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get the past locations and companies of an alumni',
  })
  @ApiResponse({
    description: 'Returns the past locations and companies of an alumni',
    type: AlumniPastLocationsAndCompaniesDto,
  })
  async getPastLocationsAndCompanies(
    @Param('id') id: string,
  ): Promise<AlumniPastLocationsAndCompaniesDto> {
    return this.alumniProfileService.getPastLocationsAndCompanies(id);
  }
}
