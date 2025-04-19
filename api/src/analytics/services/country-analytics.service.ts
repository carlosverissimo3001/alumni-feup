import { PrismaService } from '@/prisma/prisma.service';
import { QueryParamsDto } from '../dto/query-params.dto';
import { AlumniAnalyticsRepository } from '../repositories';
import { Injectable } from '@nestjs/common';
import { CountryListItemDto, CountryListResponseDto } from '../dto';
import { SortBy } from '../utils/types';

/* Mental note: Try not to use prisma directly in services.
Shouldd use be used in the DAL, ie. repositories.
*/
@Injectable()
export class CountryAnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alumniRepository: AlumniAnalyticsRepository,
  ) {}

  async getCountriesWithAlumniCount(
    query: QueryParamsDto,
  ): Promise<CountryListResponseDto> {
    const companyMap = new Map<
      string,
      {
        name: string;
        code: string;
        alumniCount: number;
        companyCount: number;
      }
    >();

    const alumni = await this.alumniRepository.getAlumniByCountry(query);

    alumni.forEach((alumni) => {
      const location = alumni.Location;
      if (
        !location?.countryCode ||
        !location?.country // ||
        // location.countryCode === 'PT'
      ) {
        return;
      }

      const countryCode = location.countryCode;

      if (!companyMap.has(countryCode)) {
        companyMap.set(countryCode, {
          name: location.country,
          code: location.countryCode,
          alumniCount: 0,
          companyCount: 0,
        });
      }

      companyMap.get(countryCode)!.alumniCount += 1;
    });

    const countries = Array.from(companyMap.entries()).map(
      ([countryCode, data]) => ({
        // We use the country code as ID, since different location id may point to the same country
        id: countryCode,
        name: data.name,
        code: data.code,
        alumniCount: data.alumniCount,
        companyCount: data.companyCount,
      }),
    );

    const countriesOrdered = this.orderCountries(countries, {
      sortBy: query.sortBy,
      direction: query.sortOrder,
    });

    const countriesPaginated = countriesOrdered.slice(
      query.offset,
      query.offset + query.limit,
    );

    return {
      countries: countriesPaginated,
      total: countries.length,
    };
  }

  orderCountries(
    countries: CountryListItemDto[],
    order: {
      sortBy: SortBy;
      direction: 'asc' | 'desc';
    },
  ) {
    return countries.sort((a, b) => {
      let comparison = 0;

      switch (order.sortBy) {
        case SortBy.ALUMNI_COUNT:
          comparison = a.alumniCount - b.alumniCount;
          break;
        case SortBy.INDUSTRY_NAME:
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          comparison = a.alumniCount - b.alumniCount;
      }

      if (order.direction === 'desc') {
        comparison = -comparison;
      }

      return comparison;
    });
  }
}
