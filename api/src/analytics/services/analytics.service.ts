import { Injectable } from '@nestjs/common';
import { SELECTOR_TYPE } from '../consts/enum';
import { AnalyticsDto, QueryParamsDto } from '../dto';
import { AlumniAnalyticsRepository } from '../repositories';
import { AlumniAnalyticsService } from './alumni-analytics.service';
import { CompanyAnalyticsService } from './company-analytics.service';
import { EducationAnalyticsService } from './education-analytics.service';
import { GeoAnalyticsService } from './geo-analytics.service';
import { RoleAnalyticsService } from './role-analytics.service';
import { SeniorityAnalyticsService } from './seniority-analytics.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly alumniAnalyticsService: AlumniAnalyticsService,
    private readonly companyAnalyticsService: CompanyAnalyticsService,
    private readonly alumniRepository: AlumniAnalyticsRepository,
    private readonly geoAnalyticsService: GeoAnalyticsService,
    private readonly roleAnalyticsService: RoleAnalyticsService,
    private readonly seniorityAnalyticsService: SeniorityAnalyticsService,
    private readonly educationAnalyticsService: EducationAnalyticsService,
  ) {}

  /**
   * Gets analytics data for alumni and companies using a single repository call
   * This is the first step in optimizing our analytics pipeline
   * Future iterations will include:
   * 1. Redis caching
   * 2. Optimized query params handling
   */
  async getAnalytics(query: QueryParamsDto): Promise<AnalyticsDto> {
    console.time('alumni-repository-find');
    const baseData = await this.alumniRepository.find(query);
    console.timeEnd('alumni-repository-find');

    console.time('process-analytics');

    const analytics: Partial<AnalyticsDto> = {};

    const allTasks = {
      alumniData: () =>
        this.alumniAnalyticsService.getAlumniAnalytics(baseData, query),
      companyData: () =>
        this.companyAnalyticsService.getCompanyAnalytics(baseData, query),
      countryData: () =>
        this.geoAnalyticsService.getCountryAnalytics(baseData, query),
      cityData: () =>
        this.geoAnalyticsService.getCityAnalytics(baseData, query),
      roleData: () =>
        this.roleAnalyticsService.getRoleAnalytics(baseData, query),
      seniorityData: () =>
        this.seniorityAnalyticsService.getSeniorityAnalytics(baseData, query),
      industryData: () =>
        this.companyAnalyticsService.getIndustryAnalytics(baseData, query),
      facultyData: () =>
        this.educationAnalyticsService.getFaculties(baseData, query),
      majorData: () =>
        this.educationAnalyticsService.getMajors(baseData, query),
      graduationData: () =>
        this.educationAnalyticsService.getGraduations(baseData, query),
    };

    const selectorMap: Record<SELECTOR_TYPE, (keyof typeof allTasks)[]> = {
      [SELECTOR_TYPE.ALUMNI]: ['alumniData'],
      [SELECTOR_TYPE.COMPANY]: ['companyData', 'industryData'],
      [SELECTOR_TYPE.GEO]: ['countryData', 'cityData'],
      [SELECTOR_TYPE.ROLE]: ['roleData'],
      [SELECTOR_TYPE.SENIORITY]: ['seniorityData'],
      [SELECTOR_TYPE.INDUSTRY]: ['industryData'],
      [SELECTOR_TYPE.EDUCATION]: ['facultyData', 'majorData', 'graduationData'],
      [SELECTOR_TYPE.ALL]: Object.keys(allTasks) as (keyof typeof allTasks)[],
    };

    const keysToRun = selectorMap[query.selectorType as SELECTOR_TYPE] ?? [];

    await Promise.all(
      keysToRun.map(async (key) => {
        (analytics as Record<string, any>)[key] = await allTasks[key]();
      }),
    );

    console.timeEnd('process-analytics');

    return analytics as AnalyticsDto;
  }
}
