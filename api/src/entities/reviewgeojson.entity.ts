import { ApiProperty } from '@nestjs/swagger';
import { Feature, FeatureCollection, Point } from 'geojson';

export enum ReviewType {
    COMPANY = 'Company',
    LOCATION = 'Location',
}

export interface CustomProperties {
    name: string[];
    reviews: number;
    alumniNames: { [key: string]: string };
    profilePics: { [key: string]: string };
    descriptions: { [key: string]: string };
    ratings: { [key: string]: number };
    upvotes: { [key: string]: string[] };
    downvotes: { [key: string]: string[] };
    reviewTypes: { [key: string]: string };
    companyNames: { [key: string]: string };
    timeSincePosted: { [key: string]: number };
    timeSincePostedType: { [key: string]: string };
}

export class ReviewGeoJSONFeature implements Feature<Point, CustomProperties> {
  @ApiProperty({ example: 'Feature' })
  readonly type: 'Feature';

  @ApiProperty({ type: Object })
  readonly geometry: Point;

  @ApiProperty({ type: Object })
  properties: CustomProperties;

  constructor() {
    this.type = 'Feature';
    this.geometry = {
      type: 'Point',
      coordinates: [0, 0],
    };
    this.properties = {
        name: [],
        reviews: 0,
        alumniNames: {},
        profilePics: {},
        descriptions: {},
        ratings: {},
        upvotes: {},
        downvotes: {},
        reviewTypes: {},
        companyNames: {},
        timeSincePosted: {},
        timeSincePostedType: {},
    };
  }
}

export class ReviewGeoJSONFeatureCollection
  implements FeatureCollection<Point, CustomProperties>
{
  @ApiProperty({ example: 'FeatureCollection' })
  readonly type: 'FeatureCollection';

  @ApiProperty({ type: [ReviewGeoJSONFeature] })
  features: Array<Feature<Point, CustomProperties>>;

  constructor() {
    this.type = 'FeatureCollection';
    this.features = [];
  }
}
