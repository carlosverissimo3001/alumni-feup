import { QueryParamsDto } from '../dto/query-params.dto';
import { AlumniAnalyticsRepository, LocationRepository } from '../repositories';
import { Injectable } from '@nestjs/common';
import {
  CountryListItemDto,
  CountryListResponseDto,
  CountryOptionDto,
  CityOptionDto,
  GetCitiesDto,
  CityListResponseDto,
  CityListItemDto,
} from '@/analytics/dto';
import { SortBy } from '../utils/types';
import {
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_OFFSET,
  DEFAULT_QUERY_SORT_BY,
  DEFAULT_QUERY_SORT_ORDER,
} from '../utils/consts';
/* Mental note: Try not to use prisma directly in services.
Shouldd use be used in the DAL, ie. repositories.
*/
@Injectable()
export class CountryAnalyticsService {
  constructor(
    private readonly alumniRepository: AlumniAnalyticsRepository,
    private readonly locationRepository: LocationRepository,
  ) {}

  async getCountriesWithAlumniCount(
    query: QueryParamsDto,
  ): Promise<CountryListResponseDto> {
    const countryMap = new Map<
      string,
      {
        name: string;
        code: string;
        alumniCount: number;
        companyCount: number;
      }
    >();

    // We're tracking the alumni and companies by country, to avoid counting the same alumni or companies multiple times
    const countedAlumniByCountry = new Map<string, Set<string>>();
    const countedCompaniesByCountry = new Map<string, Set<string>>();

    // Total Countries, regardless of filters
    const totalCountries = await this.locationRepository.countCountries();

    const alumnus = await this.alumniRepository.find(query);

    alumnus.forEach((alumnus) => {
      alumnus.roles.forEach((role) => {
        const roleLocation = role.location;
        const roleCountryCode = roleLocation?.countryCode;

        // Let's handle the alumni count first
        if (roleCountryCode) {
          // Does the country exist in the map?
          if (!countryMap.has(roleCountryCode)) {
            // No: create it
            countryMap.set(roleCountryCode, {
              name: roleLocation?.country ?? '',
              code: roleCountryCode,
              alumniCount: 0,
              companyCount: 0,
            });
            countedAlumniByCountry.set(roleCountryCode, new Set());
            countedCompaniesByCountry.set(roleCountryCode, new Set());
          }

          // Count unique alumni per country
          const countedAlumni = countedAlumniByCountry.get(roleCountryCode)!;
          if (!countedAlumni.has(alumnus.id)) {
            countryMap.get(roleCountryCode)!.alumniCount += 1;
            countedAlumni.add(alumnus.id);
          }
        }

        // Now handle company count - only count unique companies per country
        const companyLocation = role.company.location;
        const companyCountryCode = companyLocation?.countryCode;
        const companyId = role.company.id;

        if (companyCountryCode && companyId) {
          // Does the country exist in the map?
          if (!countryMap.has(companyCountryCode)) {
            // No: create it
            countryMap.set(companyCountryCode, {
              name: companyLocation?.country ?? '',
              code: companyCountryCode,
              alumniCount: 0,
              companyCount: 0,
            });
            // Initialize tracking sets
            countedAlumniByCountry.set(companyCountryCode, new Set());
            countedCompaniesByCountry.set(companyCountryCode, new Set());
          }

          // Count unique companies per country
          const countedCompanies =
            countedCompaniesByCountry.get(companyCountryCode)!;
          if (!countedCompanies.has(companyId)) {
            countryMap.get(companyCountryCode)!.companyCount += 1;
            countedCompanies.add(companyId);
          }
        }
      });
    });

    const countries = Array.from(countryMap.entries()).map(
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
      sortBy: query.sortBy || DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder || DEFAULT_QUERY_SORT_ORDER,
    });

    const countriesPaginated = countriesOrdered.slice(
      query.offset || DEFAULT_QUERY_OFFSET,
      (query.offset || DEFAULT_QUERY_OFFSET) +
        (query.limit || DEFAULT_QUERY_LIMIT),
    );

    return {
      countries: countriesPaginated,
      filteredCount: countries.length,
      count: totalCountries,
    };
  }

  async getCitiesWithAlumniCount(
    query: QueryParamsDto,
  ): Promise<CityListResponseDto> {
    const cityMap = new Map<
      string,
      { name: string; code: string; alumniCount: number; companyCount: number }
    >();

    // We're tracking the alumni and companies by city, to avoid counting the same alumni or companies multiple times
    const countedAlumniByCity = new Map<string, Set<string>>();
    const countedCompaniesByCity = new Map<string, Set<string>>();

    // Total Cities, regardless of filters
    const totalCities = await this.locationRepository.countCities();

    const alumnus = await this.alumniRepository.find(query);

    alumnus.forEach((alumnus) => {
      alumnus.roles.forEach((role) => {
        const roleLocation = role.location;
        const roleCity = roleLocation?.city;

        if (!roleCity) {
          return;
        }

        const cityId = roleLocation?.id;

        // Does the city exist in the map?
        if (!cityMap.has(cityId)) {
          // No: create it
          cityMap.set(cityId, {
            name: roleCity,
            code: roleLocation?.countryCode ?? '',
            alumniCount: 0,
            companyCount: 0,
          });
          countedAlumniByCity.set(cityId, new Set());
          countedCompaniesByCity.set(cityId, new Set());
        }

        // Count unique alumni per city
        const countedAlumni = countedAlumniByCity.get(cityId)!;
        if (!countedAlumni.has(alumnus.id)) {
          cityMap.get(cityId)!.alumniCount += 1;
          countedAlumni.add(alumnus.id);
        }

        // Now handle company count - only count unique companies per city
        const companyLocation = role.company.location;
        const companyCity = companyLocation?.city;
        const companyId = role.company.id;

        if (companyCity && companyId) {
          // Does the city exist in the map?
          if (!cityMap.has(companyCity)) {
            // No: create it
            cityMap.set(companyCity, {
              name: companyCity,
              code: companyLocation?.countryCode ?? '',
              alumniCount: 0,
              companyCount: 0,
            });
            // Initialize tracking sets
            countedAlumniByCity.set(companyCity, new Set());
            countedCompaniesByCity.set(companyCity, new Set());
          }

          // Count unique companies per country
          const countedCompanies = countedCompaniesByCity.get(companyCity)!;
          if (!countedCompanies.has(companyId)) {
            cityMap.get(companyCity)!.companyCount += 1;
            countedCompanies.add(companyId);
          }
        }
      });
    });

    const cities = Array.from(cityMap.entries()).map(([cityId, data]) => ({
      id: cityId,
      name: data.name,
      code: data.code,
      alumniCount: data.alumniCount,
      companyCount: data.companyCount,
    }));

    const citiesOrdered = this.orderCities(cities, {
      sortBy: query.sortBy || DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder || DEFAULT_QUERY_SORT_ORDER,
    });

    const citiesPaginated = citiesOrdered.slice(
      query.offset || DEFAULT_QUERY_OFFSET,
      (query.offset || DEFAULT_QUERY_OFFSET) +
        (query.limit || DEFAULT_QUERY_LIMIT),
    );

    return {
      cities: citiesPaginated,
      filteredCount: cities.length,
      count: totalCities,
    };
  }

  async getCountriesOptions(): Promise<CountryOptionDto[]> {
    const locations = await this.locationRepository.findAll();

    // Deduplicate by countryCode
    const deduplicatedLocations = locations.filter(
      (location, index, self) =>
        index === self.findIndex((t) => t.countryCode === location.countryCode),
    );

    return deduplicatedLocations.map((location) => ({
      id: location.countryCode!,
      name: location.country!,
    }));
  }

  async getCityOptions(query: GetCitiesDto): Promise<CityOptionDto[]> {
    const countryCodes = query.countryCodes;
    const cities = await this.locationRepository.getCities(countryCodes);

    return cities.map((city) => ({
      id: city.id,
      name: city.city!,
      country: city.country!,
    }));
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
        case SortBy.COMPANY_COUNT:
          comparison = a.companyCount - b.companyCount;
          break;
        case SortBy.NAME:
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

  orderCities(
    cities: CityListItemDto[],
    order: {
      sortBy: SortBy;
      direction: 'asc' | 'desc';
    },
  ) {
    return cities.sort((a, b) => {
      let comparison = 0;

      switch (order.sortBy) {
        case SortBy.ALUMNI_COUNT:
          comparison = a.alumniCount - b.alumniCount;
          break;
        case SortBy.COMPANY_COUNT:
          comparison = a.companyCount - b.companyCount;
          break;
        case SortBy.NAME:
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
