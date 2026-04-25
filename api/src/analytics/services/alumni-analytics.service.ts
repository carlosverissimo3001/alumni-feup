import { Injectable } from '@nestjs/common';

import { AlumniListResponseDto, AlumniOptionDto, QueryParamsDto } from '../dto';
import { AlumniAnalyticsEntity } from '../entities';
import { AlumniAnalyticsRepository } from '../repositories';

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

  async getAlumniAnalytics(
    alumnusUnfiltered: AlumniAnalyticsEntity[],
    query: QueryParamsDto,
  ): Promise<AlumniListResponseDto> {
    const currentRoles = new Map(
      alumnusUnfiltered.map((alumni) => [
        alumni.id,
        alumni.roles?.find((role) => role.isCurrent)?.location,
      ]),
    );

    // Note: alumnusUnfiltered is already filtered, sorted and paginated at repo level
    const totalCount = await this.alumniRepository.countAlumni(query);

    const alumniMapped = alumnusUnfiltered.map((alumni) => ({
      id: alumni.id,
      fullName: alumni.fullName,
      linkedinUrl: alumni.linkedinUrl,
      profilePictureUrl: alumni.profilePictureUrl,
      currentRoleLocation: currentRoles.get(alumni.id),
    }));

    return {
      alumni: alumniMapped,
      count: totalCount,
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
