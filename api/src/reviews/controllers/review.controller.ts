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
    import { ReviewGeoJSONFeatureCollection } from '@/entities';
    import { GetGeoJSONDto } from '@/dto';
    import { ReviewService } from '../services/review.service';
    import { GetReviewGeoJSONDto } from '@/dto/getreviewgeojson.dto';
  
    @ApiTags('V1', 'Reviews')
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

        // @Get('geoJSON')
        // @HttpCode(HttpStatus.OK)
        // @ApiOperation({
        //     summary: 'Get all alumni to be displayed in the map',
        // })
        // @ApiResponse({
        //     description: 'Returns all alumni to be displayed in the map',
        //     type: GeoJSONFeatureCollection,
        // })
        // async findAllGeoJSON(
        //     @Query() getGeoJSONDto: GetGeoJSONDto,
        // ): Promise<GeoJSONFeatureCollection> {
        //     return this.alumniService.findAllGeoJSON(getGeoJSONDto);
        // }
    
        // @Post()
        // @HttpCode(HttpStatus.CREATED)
        // @ApiOperation({ summary: 'Create a new review' })
        // @ApiResponse({
        //   description: 'Returns the created review',
        //   type: Review,
        // })
        // async create(
        //   @Body() createAlumniDto: CreateAlumniDto,
        // ): Promise<Review | null> {
        //   return this.alumniService.create(createAlumniDto);
        // }
}
  