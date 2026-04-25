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
  EducationListItemDto,
  EducationListResponseDto,
} from '@/analytics/dto';
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
import { AlumniAnalyticsRepository } from '@/analytics/repositories';

@Injectable()
export class EducationAnalyticsService {
  constructor(
    private readonly trendAnalyticsService: TrendAnalyticsService,
    private readonly alumniRepository: AlumniAnalyticsRepository,
    private readonly educationRepository: EducationRepository,
  ) {}

  async getFaculties(
    alumnusUnfiltered: AlumniAnalyticsEntity[],
    query: QueryParamsDto,
  ): Promise<FacultyListDto> {
    const educationAggregates = await this.alumniRepository.getEducationAggregates(
      query,
    );

    const facultyMap = new Map<string, FacultyListItemDto>();
    for (const grad of educationAggregates) {
      const f = grad.Course.Faculty;
      const existing = facultyMap.get(f.id);
      if (existing) {
        existing.count++;
      } else {
        facultyMap.set(f.id, {
          id: f.id,
          name: f.name,
          acronym: f.acronym,
          trend: [],
          count: 1,
        });
      }
    }

    const facultiesArray = Array.from(facultyMap.values());
    if (query.includeEducationTrend) {
      const trends = await Promise.all(
        facultiesArray.map((faculty) =>
          this.trendAnalyticsService.getFacultyTrend({
            entityId: faculty.id,
            query,
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
      count: facultyMap.size,
    };
  }

  async getEducationAnalytics(
    alumnusUnfiltered: AlumniAnalyticsEntity[],
    query: QueryParamsDto,
  ): Promise<EducationListResponseDto> {
    const educationAggregates = await this.alumniRepository.getEducationAggregates(
      query,
    );

    const educationMap = new Map<
      string,
      {
        name: string;
        acronym: string;
        faculty: string;
        facultyId: string;
        count: number;
      }
    >();

    for (const grad of educationAggregates) {
      if (!grad.courseId) continue;

      const existing = educationMap.get(grad.courseId);
      if (existing) {
        existing.count++;
      } else {
        educationMap.set(grad.courseId, {
          name: grad.Course.name,
          acronym: grad.Course.acronym,
          faculty: grad.Course.Faculty.name,
          facultyId: grad.Course.Faculty.id,
          count: 1,
        });
      }
    }

    const education: EducationListItemDto[] = Array.from(
      educationMap.entries(),
    ).map(([courseId, data]) => ({
      id: courseId,
      name: data.name,
      acronym: data.acronym,
      facultyId: data.facultyId,
      faculty: data.faculty,
      count: data.count,
      trend: [],
    }));

    if (query.includeEducationTrend) {
      const trends = await Promise.all(
        education.map((course) =>
          this.trendAnalyticsService.getMajorTrend({
            entityId: course.id,
            query,
          }),
        ),
      );
      education.forEach((course, index) => {
        course.trend = trends[index];
      });
    }

    const offset = query.offset || DEFAULT_QUERY_OFFSET;
    const limit = query.limit || DEFAULT_QUERY_LIMIT;

    const sortedEducation = sortData(education, {
      sortBy: query.sortBy ?? DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder ?? DEFAULT_QUERY_SORT_ORDER,
    });

    return {
      education: sortedEducation.slice(offset, offset + limit),
      count: educationMap.size,
    };
  }

  async getMajors(
    alumnusUnfiltered: AlumniAnalyticsEntity[],
    query: QueryParamsDto,
  ): Promise<MajorListDto> {
    const educationAggregates = await this.alumniRepository.getEducationAggregates(
      query,
    );

    const majorMap = new Map<string, MajorListItemDto>();
    for (const grad of educationAggregates) {
      const c = grad.Course;
      const existing = majorMap.get(c.id);
      if (existing) {
        existing.count++;
      } else {
        majorMap.set(c.id, {
          id: c.id,
          name: c.name,
          acronym: `[${c.Faculty.acronym}] ${c.acronym}`,
          facultyAcronym: c.Faculty.acronym,
          count: 1,
          trend: [],
        });
      }
    }

    const coursesArray = Array.from(majorMap.values());
    if (query.includeEducationTrend) {
      const trends = await Promise.all(
        coursesArray.map((course) =>
          this.trendAnalyticsService.getMajorTrend({
            entityId: course.id,
            query,
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
      count: majorMap.size,
    };
  }

  async getGraduations(
    alumnusUnfiltered: AlumniAnalyticsEntity[],
    query: QueryParamsDto,
  ): Promise<GraduationListDto> {
    const educationAggregates = await this.alumniRepository.getEducationAggregates(
      query,
    );

    const graduationMap = new Map<string, GraduationListItemDto>();
    for (const grad of educationAggregates) {
      const year = grad.conclusionYear;
      const key = `${grad.Course.acronym}-${year}`;

      const existing = graduationMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        graduationMap.set(key, {
          id: grad.courseId,
          name: grad.Course.name,
          acronym: `[${grad.Course.Faculty.acronym}] ${grad.Course.acronym}`,
          year: year,
          count: 1,
        });
      }
    }

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
