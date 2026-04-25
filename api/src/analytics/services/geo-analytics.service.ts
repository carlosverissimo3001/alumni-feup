import { Injectable } from '@nestjs/common';
import {
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_OFFSET,
  DEFAULT_QUERY_SORT_BY,
  DEFAULT_QUERY_SORT_ORDER,
  TREND_TYPE,
} from '../consts';
import {
  CityListItemDto,
  CityListResponseDto,
  CityOptionDto,
  CountryListItemDto,
  CountryListResponseDto,
  CountryOptionDto,
  GetCitiesDto,
  QueryParamsDto,
} from '../dto';
import { AlumniAnalyticsEntity } from '../entities';
import { AlumniAnalyticsRepository, LocationRepository } from '../repositories';
import { sortData } from '../utils';
import { TrendAnalyticsService } from './trend-analytics.service';

type GeoEntityMap = {
  name: string;
  code: string;
  count: number;
  latitude: number;
  longitude: number;
};

@Injectable()
export class GeoAnalyticsService {
  constructor(
    private readonly alumniRepository: AlumniAnalyticsRepository,
    private readonly locationRepository: LocationRepository,
    private readonly trendAnalyticsService: TrendAnalyticsService,
  ) {}

  async getCountryAnalytics(
    alumnusUnfiltered: AlumniAnalyticsEntity[],
    query: QueryParamsDto,
  ): Promise<CountryListResponseDto> {
    const locationAggregates = await this.alumniRepository.getLocationAggregates(
      query,
    );

    const countryMap = new Map<string, CountryListItemDto>();

    for (const loc of locationAggregates) {
      const code = loc.countryCode;
      if (!code) continue;

      const existing = countryMap.get(code);
      if (existing) {
        existing.count += loc._count.Role;
      } else {
        countryMap.set(code, {
          id: code,
          name: loc.country || '',
          code: code,
          count: loc._count.Role,
          trend: [],
          latitude: loc.latitude || 0,
          longitude: loc.longitude || 0,
        });
      }
    }

    const countries = Array.from(countryMap.values());

    if (query.includeGeoTrend) {
      const trends = await Promise.all(
        countries.map((country) =>
          this.trendAnalyticsService.getCountryTrend({
            entityId: country.code,
            query,
          }),
        ),
      );
      countries.forEach((country, index) => {
        country.trend = trends[index];
      });
    }

    // Sort and paginate
    const offset = query.offset || DEFAULT_QUERY_OFFSET;
    const limit = query.limit || DEFAULT_QUERY_LIMIT;

    const countriesOrdered = sortData(countries, {
      sortBy: query.sortBy || DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder || DEFAULT_QUERY_SORT_ORDER,
    });

    return {
      countries: countriesOrdered.slice(offset, offset + limit),
      count: countries.length,
    };
  }

  async getCityAnalytics(
    alumnusUnfiltered: AlumniAnalyticsEntity[],
    query: QueryParamsDto,
  ): Promise<CityListResponseDto> {
    const locationAggregates = await this.alumniRepository.getLocationAggregates(
      query,
    );

    const cities: CityListItemDto[] = locationAggregates
      .filter((loc) => loc.city)
      .map((loc) => ({
        id: loc.id,
        name: loc.city!,
        code: loc.countryCode || '',
        count: loc._count.Role,
        trend: [],
        latitude: loc.latitude || 0,
        longitude: loc.longitude || 0,
      }));

    if (query.includeGeoTrend) {
      const trends = await Promise.all(
        cities.map((city) =>
          this.trendAnalyticsService.getCityTrend({
            entityId: city.id,
            query,
          }),
        ),
      );
      cities.forEach((city, index) => {
        city.trend = trends[index];
      });
    }

    const offset = query.offset || DEFAULT_QUERY_OFFSET;
    const limit = query.limit || DEFAULT_QUERY_LIMIT;

    const citiesOrdered = sortData(cities, {
      sortBy: query.sortBy || DEFAULT_QUERY_SORT_BY,
      direction: query.sortOrder || DEFAULT_QUERY_SORT_ORDER,
    });

    return {
      cities: citiesOrdered.slice(offset, offset + limit),
      count: cities.length,
    };
  }

  async getCountryOptions(): Promise<CountryOptionDto[]> {
    const locations = await this.locationRepository.findAll();

    const uniqueCountries = new Map<string, { id: string; name: string }>();

    for (const location of locations) {
      const countryCode = location.countryCode;
      if (
        countryCode &&
        location.country &&
        !uniqueCountries.has(countryCode)
      ) {
        uniqueCountries.set(countryCode, {
          id: countryCode,
          name: location.country,
        });
      }
    }

    return Array.from(uniqueCountries.values());
  }

  async getCityOptions(query: GetCitiesDto): Promise<CityOptionDto[]> {
    const cities = await this.locationRepository.getCities(query.countryCodes);

    return cities
      .filter((city) => city.city && city.country)
      .map((city) => ({
        id: city.id,
        name: city.city!,
        country: city.country!,
      }));
  }

  private groupByGeoEntity<T, R extends GeoEntityMap>(
    items: T[],
    getKey: (item: T) => string,
    getData: (item: T) => {
      name: string;
      code: string;
      latitude: number;
      longitude: number;
    },
    getUniqueId: (item: T) => string,
  ) {
    const entityMap = new Map<string, R>();
    const countedEntities = new Map<string, Set<string>>();

    for (const item of items) {
      const key = getKey(item);
      const uniqueId = getUniqueId(item);

      if (!entityMap.has(key)) {
        const { name, code, latitude, longitude } = getData(item);
        entityMap.set(key, {
          name,
          code,
          count: 0,
          latitude,
          longitude,
        } as R);
        countedEntities.set(key, new Set());
      }

      const counted = countedEntities.get(key)!;
      if (!counted.has(uniqueId)) {
        (entityMap.get(key) as R).count++;
        counted.add(uniqueId);
      }
    }

    return { entityMap, countedEntities };
  }
}
