import {
  AlumniListResponseDto,
  AlumniListItemDto,
  AlumniOptionDto,
  QueryParamsDto,
} from '../dto';
import { AlumniAnalyticsRepository } from '../repositories';
import { Injectable } from '@nestjs/common';
import {
  DEFAULT_QUERY_SORT_ORDER,
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_OFFSET,
} from '../utils/consts';
import { AlumniAnalyticsEntity } from '../entities';
import { applyDateFilters } from '../utils/filters';

@Injectable()
export class AlumniAnalyticsService {
  constructor(private readonly alumniRepository: AlumniAnalyticsRepository) {}

  async getAlumniOptions(): Promise<AlumniOptionDto[]> {
    const alumni = await this.alumniRepository.findAllAlumni();
    const sortedAlumni = alumni.sort((a, b) =>
      a.fullName.localeCompare(b.fullName),
    );

    return sortedAlumni.map((alumni) => ({
      id: alumni.id,
      fullName: alumni.fullName,
    }));
  }

  async getAlumniList(query: QueryParamsDto): Promise<AlumniListResponseDto> {
    const alumnusUnfiltered = await this.alumniRepository.find(query);
    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    const alumniCount = await this.alumniRepository.countAlumni();

    const alumniOrder = this.sortAlumni(
      alumnus,
      query.sortOrder || DEFAULT_QUERY_SORT_ORDER,
    );

    const alumniPaginated = alumniOrder.slice(
      query.offset || DEFAULT_QUERY_OFFSET,
      (query.offset || DEFAULT_QUERY_OFFSET) +
        (query.limit || DEFAULT_QUERY_LIMIT),
    );

    const alumniMapped: AlumniListItemDto[] = alumniPaginated.map((alumni) => ({
      id: alumni.id,
      fullName: alumni.fullName,
      linkedinUrl: alumni.linkedinUrl,
      profilePictureUrl: alumni.profilePictureUrl,
    }));

    return {
      alumni: alumniMapped,
      count: alumniCount,
      filteredCount: alumnus.length,
    };
  }

  sortAlumni(
    alumnus: AlumniAnalyticsEntity[],
    direction: 'asc' | 'desc',
  ): AlumniAnalyticsEntity[] {
    return [...alumnus].sort((a, b) => {
      const comparison = a.fullName.localeCompare(b.fullName);
      return direction === 'asc' ? comparison : -comparison;
    });
  }
}
