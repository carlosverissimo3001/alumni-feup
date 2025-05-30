import { ReviewGeoJSONFeatureCollection } from '@/entities';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChangeReviewScoreDto } from '../dto/change-review-score.dto';
import { CreateReviewDto } from '../dto/create-review.dto';
import { GetReviewGeoJSONDto } from '../dto/get-review-geojson.dto';
import { ReviewService } from '../services/review.service';

@ApiTags('V1')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('geoJSON')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all the review to be displayed on the map',
  })
  @ApiResponse({
    description: 'Returns all the review to be displayed on the map',
    type: ReviewGeoJSONFeatureCollection,
  })
  async findAllGeoJSON(
    @Query() getGeoJSONDto: GetReviewGeoJSONDto,
  ): Promise<ReviewGeoJSONFeatureCollection> {
    return this.reviewService.findAllGeoJSON(getGeoJSONDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({
    description: 'Returns the created review',
  })
  async create(@Body() createReviewDto: CreateReviewDto): Promise<void> {
    return this.reviewService.create(createReviewDto);
  }

  @Post('changeScore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a review score' })
  @ApiResponse({
    description: 'Returns the created alumni',
  })
  async changeScore(
    @Body() changeReviewScoreDto: ChangeReviewScoreDto,
  ): Promise<void> {
    return this.reviewService.changeReviewScoring(changeReviewScoreDto);
  }
}
