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
import {
  CreateAlumniDto,
  GetGeoJSONDto,
  MarkAsReviewedDto,
  VerifyEmailDto,
  VerifyEmailTokenDto,
} from '@/dto';
import { AlumniExtended } from '@/entities/alumni.entity';

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

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Verify the email of the alumni by generating a token and sending it to the email',
  })
  @ApiResponse({
    description: 'Returns the verified email',
  })
  async verifyEmail(@Body() body: VerifyEmailDto): Promise<void> {
    return this.alumniService.verifyEmail(body);
  }

  @Post('verify-email/token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate the token against the email' })
  @ApiResponse({
    description: 'Returns the status of the validation',
  })
  async verifyEmailToken(@Body() body: VerifyEmailTokenDto): Promise<void> {
    return this.alumniService.verifyEmailToken(body);
  }
}
