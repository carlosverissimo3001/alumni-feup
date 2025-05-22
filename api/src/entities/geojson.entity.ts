import { ApiProperty } from '@nestjs/swagger';
import { Feature, FeatureCollection, Point } from 'geojson';

export interface CustomProperties {
  name: string[];
  students: number;
  totalAlumni: number;
  totalAlumniPrev: number;
  compareYearStudents: number | undefined;
  listLinkedinLinksByUser: { [key: string]: string };
  coursesYearConclusionByUser: { [key: string]: { [key: string]: string } };
  profilePics: { [key: string]: string };
  jobTitles : { [key: string]: string };
  companyNames : { [key: string]: string };
}

export class GeoJSONFeature implements Feature<Point, CustomProperties> {
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
      students: 0,
      totalAlumni: 0,
      totalAlumniPrev: 0,
      compareYearStudents: undefined,
      listLinkedinLinksByUser: {},
      coursesYearConclusionByUser: {},
      profilePics: {},
      jobTitles: {},
      companyNames: {},
    };
  }
}

export class GeoJSONFeatureCollection
  implements FeatureCollection<Point, CustomProperties>
{
  @ApiProperty({ example: 'FeatureCollection' })
  readonly type: 'FeatureCollection';

  @ApiProperty({ type: [GeoJSONFeature] })
  features: Array<Feature<Point, CustomProperties>>;

  constructor() {
    this.type = 'FeatureCollection';
    this.features = [];
  }
}
