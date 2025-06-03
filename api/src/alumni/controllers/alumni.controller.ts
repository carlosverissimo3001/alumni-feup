import { AlumniAnalyticsEntity } from '@/analytics/entities/alumni.entity';
import { RoleAnalyticsEntity } from '@/analytics/entities/role.entity';
import { Alumni, GeoJSONFeatureCollection } from '@/entities';
import { AlumniExtended } from '@/entities/alumni.entity';
import {
  ArgumentsHost,
  Body,
  Catch,
  Controller,
  ExceptionFilter,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerException } from '@nestjs/throttler';
import { UPDATE_REQUEST_THROTTLE_TTL } from '../consts/consts';
import {
  CreateAlumniDto,
  EvaluateSeniorityLevelDto,
  GetGeoJSONDto,
  MarkAsReviewedDto,
  UpdateClassificationDto,
  UpdateSeniorityLevelDto,
} from '../dto';
import { AlumniPastLocationsAndCompaniesDto } from '../dto/alumni-profile.dto';
import { EvaluateClassificationDto } from '../dto/evaluate-classification.dto';
import { AlumniProfileService } from '../services/alumni-profile.service';
import { AlumniService } from '../services/alumni.service';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = ctx.getResponse();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message:
        'You can only request a data update once per week. Please try again later.',
    });
  }
}

@ApiTags('V1')
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

  @Get('profile/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get basic profile of an alumni' })
  @ApiResponse({
    description: 'Returns the basic profile of an alumni',
    type: AlumniAnalyticsEntity,
  })
  async getProfile(@Param('id') id: string): Promise<AlumniAnalyticsEntity> {
    return this.alumniProfileService.getProfile(id);
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

  @Post('/role/accept-seniority-level/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept the seniority level of a role',
  })
  @ApiResponse({
    description: 'Returns the role with the accepted seniority level',
    type: RoleAnalyticsEntity,
  })
  async evaluateSeniorityLevel(
    @Param('id') id: string,
    @Body() body: EvaluateSeniorityLevelDto,
  ): Promise<RoleAnalyticsEntity> {
    return this.alumniProfileService.evaluateSeniorityLevel(id, body);
  }

  @Post('/role/evaluate-classification/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Evaluate the classification of a role',
  })
  @ApiResponse({
    description: 'Returns the role with the evaluated classification',
    type: RoleAnalyticsEntity,
  })
  async evaluateClassification(
    @Param('id') id: string,
    @Body() body: EvaluateClassificationDto,
  ): Promise<RoleAnalyticsEntity> {
    return this.alumniProfileService.evaluateJobClassification(id, body);
  }

  @Post('role/update-classification/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update the classification of a role',
    description: 'Update the classification of a role',
  })
  @ApiResponse({
    description: 'Returns the role with the updated classification',
    type: RoleAnalyticsEntity,
  })
  async updateClassification(
    @Param('id') id: string,
    @Body() body: UpdateClassificationDto,
  ): Promise<RoleAnalyticsEntity> {
    return this.alumniProfileService.updateJobClassification(id, body);
  }

  @Post('role/update-seniority-level/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update the seniority level of a role',
    description: 'Update the seniority level of a role',
  })
  @ApiResponse({
    description: 'Returns the role with the updated seniority level',
    type: RoleAnalyticsEntity,
  })
  async updateSeniorityLevel(
    @Param('id') id: string,
    @Body() body: UpdateSeniorityLevelDto,
  ): Promise<RoleAnalyticsEntity> {
    return this.alumniProfileService.updateSeniorityLevel(id, body);
  }

  @Post('request-data-update/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request a data update for an alumni',
  })
  @ApiOkResponse({
    description: 'A success message',
  })
  @UseFilters(ThrottlerExceptionFilter)
  @Throttle({ default: { limit: 5, ttl: UPDATE_REQUEST_THROTTLE_TTL } })
  async requestDataUpdate(@Param('id') id: string): Promise<string> {
    return this.alumniProfileService.requestDataUpdate(id);
  }
}
