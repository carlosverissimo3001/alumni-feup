import { Injectable } from '@nestjs/common';
import { EducationRepository } from '@/analytics/repositories';
import {
  QueryParamsDto,
  FacultyListItemDto,
  FacultyListDto,
  MajorListDto,
  MajorListItemDto,
  GraduationListDto,
  GraduationListItemDto,
} from '@/analytics/dto';
import { applyDateFilters } from '@/analytics/utils/filters';
import { TrendAnalyticsService } from './trend-analytics.service';
import {
  DEFAULT_QUERY_OFFSET,
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_SORT_BY,
  DEFAULT_QUERY_SORT_ORDER,
  SORT_BY,
} from '../consts';
import { sortData } from '../utils';
import { AlumniAnalyticsEntity } from '../entities';

@Injectable()
export class EducationAnalyticsService {
  constructor(
    private readonly trendAnalyticsService: TrendAnalyticsService,
    private readonly educationRepository: EducationRepository,
  ) {}

  async getFaculties(
    alumnusUnfiltered: AlumniAnalyticsEntity[],
    query: QueryParamsDto,
  ): Promise<FacultyListDto> {
    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    const graduations = alumnus.flatMap((a) => a.graduations || []);

    const faculties = graduations.reduce((map, graduation) => {
      const facultyId = graduation.course.facultyId;
      const faculty = map.get(facultyId) || {
        id: facultyId,
        name: graduation.course.faculty.name,
        acronym: graduation.course.faculty.acronym,
        trend: [],
        count: 0,
      };

      faculty.count += 1;
      map.set(facultyId, faculty);
      return map;
    }, new Map<string, FacultyListItemDto>());

    const facultiesArray = Array.from(faculties.values());
    if (query.includeEducationTrend) {
      const trends = await Promise.all(
        facultiesArray.map((faculty) =>
          this.trendAnalyticsService.getFacultyTrend({
            data: alumnusUnfiltered,
            entityId: faculty.id,
          }),
        ),
      );
      facultiesArray.forEach((faculty, index) => {
        faculty.trend = trends[index];
      });
    }

    // Sort and paginate
    const offset = query.offset || DEFAULT_QUERY_OFFSET;
    const limit = query.limit || DEFAULT_QUERY_LIMIT;

    const sortedFaculties = sortData(facultiesArray, {
      sortBy: query.sortBy ?? DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder ?? DEFAULT_QUERY_SORT_ORDER,
    });

    return {
      faculties: sortedFaculties.slice(offset, offset + limit),
      count: faculties.size,
    };
  }

  async getMajors(
    alumnusUnfiltered: AlumniAnalyticsEntity[],
    query: QueryParamsDto,
  ): Promise<MajorListDto> {
    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    const graduations = alumnus.flatMap((a) => a.graduations || []);

    const courses = graduations.reduce((map, graduation) => {
      const courseId = graduation.courseId;
      const course = map.get(courseId) || {
        id: courseId,
        name: graduation.course.name,
        acronym: `[${graduation.course.faculty.acronym}] ${graduation.course.acronym}`,
        facultyAcronym: graduation.course.faculty.acronym,
        count: 0,
        trend: [],
      };

      course.count += 1;
      map.set(courseId, course);
      return map;
    }, new Map<string, MajorListItemDto>());

    const coursesArray = Array.from(courses.values());
    if (query.includeEducationTrend) {
      const trends = await Promise.all(
        coursesArray.map((course) =>
          this.trendAnalyticsService.getMajorTrend({
            data: alumnusUnfiltered,
            entityId: course.id,
          }),
        ),
      );
      coursesArray.forEach((course, index) => {
        course.trend = trends[index];
      });
    }

    const offset = query.offset || DEFAULT_QUERY_OFFSET;
    const limit = query.limit || DEFAULT_QUERY_LIMIT;

    const sortedCourses = sortData(coursesArray, {
      sortBy: query.sortBy ?? DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder ?? DEFAULT_QUERY_SORT_ORDER,
    });

    return {
      majors: sortedCourses.slice(offset, offset + limit),
      count: courses.size,
    };
  }

  getGraduations(
    alumnusUnfiltered: AlumniAnalyticsEntity[],
    query: QueryParamsDto,
  ): GraduationListDto {
    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    const graduations = alumnus.flatMap((a) => a.graduations || []);

    const graduationMap = graduations.reduce((map, graduation) => {
      const key = `${graduation.course.acronym}-${graduation.conclusionYear}`;
      const grad = map.get(key) || {
        id: graduation.courseId,
        name: graduation.course.name,
        acronym: `[${graduation.course.faculty.acronym}] ${graduation.course.acronym}`,
        year: graduation.conclusionYear,
        count: 0,
      };

      grad.count += 1;
      map.set(key, grad);
      return map;
    }, new Map<string, GraduationListItemDto>());

    const offset = query.offset || DEFAULT_QUERY_OFFSET;
    const limit = query.limit || DEFAULT_QUERY_LIMIT;

    const graduationsArray = Array.from(graduationMap.values());
    const sortedGraduations = this.sortGraduations(
      query.sortBy ?? DEFAULT_QUERY_SORT_BY,
      query.sortOrder ?? DEFAULT_QUERY_SORT_ORDER,
      graduationsArray,
    );

    return {
      graduations: sortedGraduations.slice(offset, offset + limit),
      count: graduationMap.size,
    };
  }

  private sortGraduations<
    T extends { name: string; count: number; year?: number },
  >(sortBy: SORT_BY, direction: 'asc' | 'desc', data: T[]): T[] {
    return [...data].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case SORT_BY.NAME:
          comparison = a.name.localeCompare(b.name);
          break;
        case SORT_BY.COUNT:
          comparison = a.count - b.count;
          break;
        case SORT_BY.YEAR:
          comparison = (a.year ?? 0) - (b.year ?? 0);
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }
}
