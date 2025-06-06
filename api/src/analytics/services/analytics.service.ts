import { Injectable } from '@nestjs/common';
import { AlumniAnalyticsService } from './alumni-analytics.service';
import { CompanyAnalyticsService } from './company-analytics.service';
import { QueryParamsDto } from '../dto';
import { AlumniAnalyticsRepository } from '../repositories';
import { GeoAnalyticsService } from './geo-analytics.service';
import { AnalyticsDto } from '../dto';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly alumniAnalyticsService: AlumniAnalyticsService,
    private readonly companyAnalyticsService: CompanyAnalyticsService,
    private readonly alumniRepository: AlumniAnalyticsRepository,
    private readonly geoAnalyticsService: GeoAnalyticsService,
  ) {}

  /**
   * Gets analytics data for alumni and companies using a single repository call
   * This is the first step in optimizing our analytics pipeline
   * Future iterations will include:
   * 1. Redis caching
   * 2. More analytics services (education, geo, etc)
   * 3. Optimized query params handling
   */
  async getAnalytics(query: QueryParamsDto): Promise<AnalyticsDto> {
    // Single repository call to get base data
    console.time('alumni-repository-find');
    const baseData = await this.alumniRepository.find(query);
    console.timeEnd('alumni-repository-find');

    // Process data for each service in parallel
    console.time('process-analytics');
    const [alumniData, companyData, countryData, cityData] = await Promise.all([
      this.alumniAnalyticsService.getAlumniAnalytics(baseData, query),
      this.companyAnalyticsService.getCompanyAnalytics(baseData, query),
      this.geoAnalyticsService.getCountryAnalytics(baseData, query),
      this.geoAnalyticsService.getCityAnalytics(baseData, query),
    ]);
    console.timeEnd('process-analytics');

    return {
      alumniData,
      companyData,
      countryData,
      cityData,
    };
  }
}
