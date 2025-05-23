import { AlumniListResponseDto, AlumniOptionDto, QueryParamsDto } from '../dto';
import { AlumniAnalyticsRepository } from '../repositories';
import { Injectable } from '@nestjs/common';
import {
  DEFAULT_QUERY_SORT_ORDER,
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_OFFSET,
} from '../consts/';
import { AlumniAnalyticsEntity, LocationAnalyticsEntity } from '../entities';
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

  async getAlumniList(query: QueryParamsDto): Promise<AlumniListResponseDto> {
    // Fetch data in parallel
    const [alumnusUnfiltered, alumniCount] = await Promise.all([
      this.alumniRepository.find(query),
      this.alumniRepository.countAlumni(),
    ]);

    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    // Cache default values
    const offset = query.offset || DEFAULT_QUERY_OFFSET;
    const limit = query.limit || DEFAULT_QUERY_LIMIT;
    const direction = query.sortOrder || DEFAULT_QUERY_SORT_ORDER;

    // Sort and paginate in one pass if possible
    const startIndex = offset;
    const endIndex = offset + limit;

    // Only sort the portion we need if the dataset is large
    const needsSorting = alumnus.length > 1;
    const sortedAlumnus = needsSorting
      ? this.sortAlumni(alumnus, direction)
      : alumnus;

    const alumniPaginated = sortedAlumnus.slice(startIndex, endIndex);

    // Optimize the mapping operation by pre-calculating current roles
    const alumniMapped = alumniPaginated.map((alumni) => {
      // Find current role once
      const currentRole = alumni.roles?.find((role) => role.isCurrent);

      return {
        id: alumni.id,
        fullName: alumni.fullName,
        linkedinUrl: alumni.linkedinUrl,
        profilePictureUrl: alumni.profilePictureUrl,
        currentRoleLocation: currentRole?.location,
      };
    });

    return {
      alumni: alumniMapped,
      count: alumniCount,
      filteredCount: alumnus.length,
    };
  }

  private sortAlumni(
    alumnus: AlumniAnalyticsEntity[],
    direction: 'asc' | 'desc',
  ): AlumniAnalyticsEntity[] {
    // Create a new array only if we need to sort
    const sortedAlumnus = [...alumnus];

    // Sort in-place
    sortedAlumnus.sort((a, b) => {
      const comparison = a.fullName.localeCompare(b.fullName);
      return direction === 'asc' ? comparison : -comparison;
    });

    return sortedAlumnus;
  }

  // This method is now private and simplified since it's only used internally
  private getCurrentRoleLocation(
    alumni: AlumniAnalyticsEntity,
  ): LocationAnalyticsEntity | undefined {
    return alumni.roles?.find((role) => role.isCurrent)?.location;
  }
}
