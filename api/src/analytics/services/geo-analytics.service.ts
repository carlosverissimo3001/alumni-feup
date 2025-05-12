import { QueryParamsDto } from '../dto/query-params.dto';
import { AlumniAnalyticsRepository, LocationRepository } from '../repositories';
import { Injectable } from '@nestjs/common';
import {
  CountryListResponseDto,
  CountryOptionDto,
  GetCitiesDto,
  CityListResponseDto,
  CityOptionDto,
} from '@/analytics/dto';
import { TrendType } from '../utils/types';
import {
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_OFFSET,
  DEFAULT_QUERY_SORT_BY,
  DEFAULT_QUERY_SORT_ORDER,
} from '../utils/consts';
import { sortData } from '../utils';
import { applyDateFilters } from '../utils/filters';
import { TrendAnalyticsService } from './trend-analytics.service';

@Injectable()
export class GeoAnalyticsService {
  constructor(
    private readonly alumniRepository: AlumniAnalyticsRepository,
    private readonly locationRepository: LocationRepository,
    private readonly trendAnalyticsService: TrendAnalyticsService,
  ) {}

  async getCountriesWithAlumniCount(
    query: QueryParamsDto,
  ): Promise<CountryListResponseDto> {
    const countryMap = new Map<
      string,
      {
        name: string;
        code: string;
        count: number;
      }
    >();

    // We're tracking the alumni and companies by country, to avoid counting the same alumni or companies multiple times
    const countedAlumniByCountry = new Map<string, Set<string>>();

    // Total Countries, regardless of filters
    const totalCountries = await this.locationRepository.countCountries();

    // I know, it's really ugly, but I need the unfiltered data to get the trend
    // As it is always fixed to the last 15 years
    const alumnusUnfiltered = await this.alumniRepository.find(query);

    // This contains the actual data
    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    alumnus.forEach((alumnus) => {
      alumnus.roles.forEach((role) => {
        const roleLocation = role.location;
        const roleCountryCode = roleLocation?.countryCode;

        // Does the role have a country?
        if (roleCountryCode) {
          // Does the country exist in the map?
          if (!countryMap.has(roleCountryCode)) {
            // No: create it
            countryMap.set(roleCountryCode, {
              name: roleLocation?.country ?? '',
              code: roleCountryCode,
              count: 0,
            });
            countedAlumniByCountry.set(roleCountryCode, new Set());
          }

          // Count unique alumni per country
          const countedAlumni = countedAlumniByCountry.get(roleCountryCode)!;
          if (!countedAlumni.has(alumnus.id)) {
            countryMap.get(roleCountryCode)!.count += 1;
            countedAlumni.add(alumnus.id);
          }
        }
      });
    });

    const countries = Array.from(countryMap.entries()).map(
      ([countryCode, data]) => {
        // We use the country code as ID, since different location id may point to the same country
        return {
          id: countryCode,
          name: data.name,
          code: data.code,
          count: data.count,
          trend: query.includeTrend
            ? this.trendAnalyticsService.getCountryTrend({
                data: alumnusUnfiltered,
                type: TrendType.ALUMNI_COUNT,
                entityId: countryCode,
              })
            : [],
        };
      },
    );

    const countriesOrdered = sortData(countries, {
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
      { name: string; code: string; count: number }
    >();

    // We're tracking the alumni and companies by city, to avoid counting the same alumni or companies multiple times
    const countedAlumniByCity = new Map<string, Set<string>>();

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

        const roleCityId = roleLocation?.id;

        // Does the city exist in the map?
        if (!cityMap.has(roleCityId)) {
          // No: create it
          cityMap.set(roleCityId, {
            name: roleCity,
            code: roleLocation?.countryCode ?? '',
            count: 0,
          });
          countedAlumniByCity.set(roleCityId, new Set());
        }

        // Count unique alumni per city
        const countedAlumni = countedAlumniByCity.get(roleCityId)!;
        if (!countedAlumni.has(alumnus.id)) {
          cityMap.get(roleCityId)!.count += 1;
          countedAlumni.add(alumnus.id);
        }
      });
    });

    const cities = Array.from(cityMap.entries()).map(([cityId, data]) => {
      return {
        id: cityId,
        name: data.name,
        code: data.code,
        count: data.count,
        trend: query.includeTrend
          ? this.trendAnalyticsService.getCityTrend({
              data: alumnus,
              entityId: cityId,
            })
          : [],
      };
    });

    const citiesOrdered = sortData(cities, {
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
}
