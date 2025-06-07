import { Injectable } from '@nestjs/common';
import {
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_OFFSET,
  DEFAULT_QUERY_SORT_ORDER,
} from '../consts';
import { AlumniListResponseDto, AlumniOptionDto, QueryParamsDto } from '../dto';
import { AlumniAnalyticsEntity } from '../entities';
import { AlumniAnalyticsRepository } from '../repositories';
import { applyDateFilters } from '../utils/filters';

@Injectable()
export class AlumniAnalyticsService {
  constructor(private readonly alumniRepository: AlumniAnalyticsRepository) {}

  async getAlumniOptions(): Promise<AlumniOptionDto[]> {
    const alumni = await this.alumniRepository.findAllAlumni();
    alumni.sort((a, b) => a.fullName.localeCompare(b.fullName));
    return alumni.map(({ id, fullName }) => ({
      id,
      fullName,
    }));
  }

  getAlumniAnalytics(
    alumnusUnfiltered: AlumniAnalyticsEntity[],
    query: QueryParamsDto,
  ): AlumniListResponseDto {
    const currentRoles = new Map(
      alumnusUnfiltered.map((alumni) => [
        alumni.id,
        alumni.roles?.find((role) => role.isCurrent)?.location,
      ]),
    );

    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    const offset = query.offset || DEFAULT_QUERY_OFFSET;
    const limit = query.limit || DEFAULT_QUERY_LIMIT;
    const direction = query.sortOrder || DEFAULT_QUERY_SORT_ORDER;

    const startIndex = offset;
    const endIndex = offset + limit;

    const needsSorting = alumnus.length > 1;
    const sortedAlumnus = needsSorting
      ? this.sortAlumni(alumnus, direction)
      : alumnus;

    const alumniPaginated = sortedAlumnus.slice(startIndex, endIndex);

    const alumniMapped = alumniPaginated.map((alumni) => ({
      id: alumni.id,
      fullName: alumni.fullName,
      linkedinUrl: alumni.linkedinUrl,
      profilePictureUrl: alumni.profilePictureUrl,
      currentRoleLocation: currentRoles.get(alumni.id),
    }));

    return {
      alumni: alumniMapped,
      count: alumnus.length,
    };
  }

  private sortAlumni(
    alumnus: AlumniAnalyticsEntity[],
    direction: 'asc' | 'desc',
  ): AlumniAnalyticsEntity[] {
    const sortedAlumnus = [...alumnus];

    sortedAlumnus.sort((a, b) => {
      const comparison = a.fullName.localeCompare(b.fullName);
      return direction === 'asc' ? comparison : -comparison;
    });

    return sortedAlumnus;
  }
}
