import { Injectable } from '@nestjs/common';
import {
  AlumniAnalyticsRepository,
  EducationRepository,
} from '@/analytics/repositories';
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
  sortData,
  SortBy,
} from '../utils';

@Injectable()
export class EducationAnalyticsService {
  constructor(
    private readonly alumniRepository: AlumniAnalyticsRepository,
    private readonly trendAnalyticsService: TrendAnalyticsService,
    private readonly educationRepository: EducationRepository,
  ) {}

  async getFaculties(query: QueryParamsDto): Promise<FacultyListDto> {
    const alumnusUnfiltered = await this.alumniRepository.find(query);
    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    const totalFaculties = await this.educationRepository.countFaculties();

    // Grouping is done at faculty level
    const faculties = new Map<string, FacultyListItemDto>();

    // outer loop -> for every alumni
    alumnus.forEach((alumnus) => {
      // inner loop -> for every graduation of the alumni
      alumnus.graduations.forEach((graduation) => {
        const facultyId = graduation.course.facultyId;
        let faculty = faculties.get(facultyId);

        // Is this a new faculty? (Note: For now, we just have FEUP)
        if (!faculty) {
          faculties.set(facultyId, {
            id: facultyId,
            name: graduation.course.faculty.name,
            acronym: graduation.course.faculty.acronym,
            // We'll set the trend in the outer loop
            trend: [],
            count: 0,
          });
          faculty = faculties.get(facultyId)!;
        }

        faculty.count += 1;
      });
    });

    // hey man, this is awful, please, for your own sanity, find a better approach
    const facultiesArray = Array.from(faculties.entries()).map(
      ([facultyId, data]) => {
        return {
          id: facultyId,
          name: data.name,
          acronym: data.acronym,
          trend: query.includeTrend
            ? this.trendAnalyticsService.getFacultyTrend({
                data: alumnusUnfiltered,
                entityId: facultyId,
              })
            : [],
          count: data.count,
        };
      },
    );

    const sortedFaculties = sortData(facultiesArray, {
      sortBy: query.sortBy ?? DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder ?? DEFAULT_QUERY_SORT_ORDER,
    });

    const paginatedFaculties = sortedFaculties.slice(
      query.offset || DEFAULT_QUERY_OFFSET,
      (query.offset || DEFAULT_QUERY_OFFSET) +
        (query.limit || DEFAULT_QUERY_LIMIT),
    );

    return {
      faculties: paginatedFaculties,
      count: totalFaculties,
      filteredCount: faculties.size,
    };
  }

  async getMajors(query: QueryParamsDto): Promise<MajorListDto> {
    const alumnusUnfiltered = await this.alumniRepository.find(query);
    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    const totalMajors = await this.educationRepository.countCourses();

    // Grouping is done at course level
    const courses = new Map<string, MajorListItemDto>();

    alumnus.forEach((alumnus) => {
      alumnus.graduations.forEach((graduation) => {
        const courseId = graduation.courseId;
        let course = courses.get(courseId);

        if (!course) {
          courses.set(courseId, {
            id: courseId,
            name: graduation.course.name,
            acronym: `[${graduation.course.faculty.acronym}] ${graduation.course.acronym}`,
            facultyAcronym: graduation.course.faculty.acronym,
            count: 0,
            trend: [],
          });
          course = courses.get(courseId)!;
        }

        course.count += 1;
      });
    });

    const coursesArray = Array.from(courses.entries()).map(
      ([courseId, data]) => {
        return {
          id: courseId,
          name: data.name,
          acronym: data.acronym,
          facultyAcronym: data.facultyAcronym,
          trend: query.includeTrend
            ? this.trendAnalyticsService.getMajorTrend({
                data: alumnusUnfiltered,
                entityId: courseId,
              })
            : [],
          count: data.count,
        };
      },
    );

    const sortedCourses = sortData(coursesArray, {
      sortBy: query.sortBy ?? DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder ?? DEFAULT_QUERY_SORT_ORDER,
    });

    const paginatedCourses = sortedCourses.slice(
      query.offset || DEFAULT_QUERY_OFFSET,
      (query.offset || DEFAULT_QUERY_OFFSET) +
        (query.limit || DEFAULT_QUERY_LIMIT),
    );

    return {
      majors: paginatedCourses,
      count: totalMajors,
      filteredCount: courses.size,
    };
  }

  async getGraduations(query: QueryParamsDto): Promise<GraduationListDto> {
    const totalGraduations = await this.educationRepository.countGraduations();

    // Grouping is done at graduation level
    const graduations = new Map<string, GraduationListItemDto>();

    const alumnusUnfiltered = await this.alumniRepository.find(query);
    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    alumnus.forEach((alumnus) => {
      alumnus.graduations.forEach((graduation) => {
        const key = `${graduation.course.acronym}-${graduation.conclusionYear}`;
        let grad = graduations.get(key);

        if (!grad) {
          graduations.set(key, {
            id: graduation.courseId,
            name: graduation.course.name,
            acronym: `[${graduation.course.faculty.acronym}] ${graduation.course.acronym}`,
            year: graduation.conclusionYear,
            count: 0,
          });
          grad = graduations.get(key)!;
        }

        grad.count += 1;
      });
    });

    const graduationsArray = Array.from(graduations.values());
    const sortedGraduations = this.sortGraduations(
      query.sortBy ?? DEFAULT_QUERY_SORT_BY,
      query.sortOrder ?? DEFAULT_QUERY_SORT_ORDER,
      graduationsArray,
    );

    const paginatedGraduations = sortedGraduations.slice(
      query.offset || DEFAULT_QUERY_OFFSET,
      (query.offset || DEFAULT_QUERY_OFFSET) +
        (query.limit || DEFAULT_QUERY_LIMIT),
    );

    return {
      graduations: paginatedGraduations,
      count: totalGraduations,
      filteredCount: graduations.size,
    };
  }

  sortGraduations<T extends { name: string; count: number; year?: number }>(
    sortBy: SortBy,
    direction: 'asc' | 'desc',
    data: T[],
  ): T[] {
    return [...data].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case SortBy.NAME:
          comparison = a.name.localeCompare(b.name);
          break;
        case SortBy.COUNT:
          comparison = a.count - b.count;
          break;
        case SortBy.YEAR:
          comparison = (a.year ?? 0) - (b.year ?? 0);
          break;
        default:
          break;
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }
}
