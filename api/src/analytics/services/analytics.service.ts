import { Injectable } from '@nestjs/common';
import { SELECTOR_TYPE } from '../consts/enum';
import {
  AnalyticsDto,
  AnalyticsOptionsDto,
  OptionsParamDto,
  QueryParamsDto,
} from '../dto';
import { AlumniAnalyticsRepository } from '../repositories';
import { AlumniAnalyticsService } from './alumni-analytics.service';
import { CompanyAnalyticsService } from './company-analytics.service';
import { EducationAnalyticsService } from './education-analytics.service';
import { GeoAnalyticsService } from './geo-analytics.service';
import { IndustryAnalyticsService } from './industry-analytics.service';
import { RoleAnalyticsService } from './role-analytics.service';
import { SeniorityAnalyticsService } from './seniority-analytics.service';
import { CourseService } from '@/course/services/course.service';
import { FacultyService } from '@/faculty/services/faculty.service';

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
    private readonly industryAnalyticsService: IndustryAnalyticsService,
    private readonly facultyService: FacultyService,
    private readonly courseService: CourseService,
  ) {}

  /**
   * Gets analytics data for alumni and companies using a single repository call
   * This is the first step in optimizing our analytics pipeline
   * Future iterations will include:
   * 1. Redis caching
   * 2. Optimized query params handling
   */
  async getAnalytics(query: QueryParamsDto): Promise<AnalyticsDto> {
    if (process.env.NODE_ENV === 'development') {
      console.time('alumni-repository-find');
    }
    const baseData = await this.alumniRepository.find(query);
    if (process.env.NODE_ENV === 'development') {
      console.timeEnd('alumni-repository-find');
    }

    if (process.env.NODE_ENV === 'development') {
      console.time('process-analytics');
    }

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
        this.industryAnalyticsService.getIndustryAnalytics(baseData, query),
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

      // AlumnIData uses different params, so we don't need to run it for the all selector
      [SELECTOR_TYPE.ALL]: Object.keys(allTasks).filter(
        (key) => !['alumniData'].includes(key),
      ) as (keyof typeof allTasks)[],
    };

    const keysToRun = selectorMap[query.selectorType as SELECTOR_TYPE] ?? [];

    await Promise.all(
      keysToRun.map(async (key) => {
        (analytics as Record<string, any>)[key] = await allTasks[key]();
      }),
    );

    if (process.env.NODE_ENV === 'development') {
      console.timeEnd('process-analytics');
    }

    return analytics as AnalyticsDto;
  }

  /**
   * Used for the front-end to fetch the options for the filters
   * @param query - The query parameters for the options
   * @returns - The options for the filters
   */
  async getOptions(query: OptionsParamDto): Promise<AnalyticsOptionsDto> {
    const analyticsOptions: Partial<AnalyticsOptionsDto> = {};

    const allTasks = {
      countries: () => this.geoAnalyticsService.getCountryOptions(),
      industries: () => this.industryAnalyticsService.getIndustryOptions(),
      roles: () => this.roleAnalyticsService.getRoleOptions(),
      companies: () => this.companyAnalyticsService.getCompanyOptions(),
      alumni: () => this.alumniAnalyticsService.getAlumniOptions(),
      // Only courses and cities take params
      cities: () => this.geoAnalyticsService.getCityOptions(query),
      courses: () => this.courseService.find(query),
      faculties: () => this.facultyService.findAll(),
    };

    const selectorMap: Record<
      Partial<SELECTOR_TYPE>,
      (keyof typeof allTasks)[]
    > = {
      [SELECTOR_TYPE.ALUMNI]: ['alumni'],
      [SELECTOR_TYPE.COMPANY]: ['companies'],
      [SELECTOR_TYPE.GEO]: ['cities'],
      [SELECTOR_TYPE.ROLE]: ['roles'],
      [SELECTOR_TYPE.SENIORITY]: [],
      [SELECTOR_TYPE.INDUSTRY]: ['industries'],
      [SELECTOR_TYPE.EDUCATION]: ['courses'],

      // The ones we're excluding are handled separately, as they use params
      [SELECTOR_TYPE.ALL]: Object.keys(allTasks).filter(
        (key) => !['courses', 'cities'].includes(key),
      ) as (keyof typeof allTasks)[],
    };

    const keysToRun = selectorMap[query.selectorType] ?? [];

    await Promise.all(
      keysToRun.map(async (key) => {
        (analyticsOptions as Record<string, any>)[key] = await allTasks[key]();
      }),
    );
    return analyticsOptions as AnalyticsOptionsDto;
  }
}
