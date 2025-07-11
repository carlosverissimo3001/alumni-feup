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
} from '../dto';
import { QueryParamsDto } from '../dto/query-params.dto';
import { AlumniAnalyticsEntity } from '../entities';
import { AlumniAnalyticsRepository, LocationRepository } from '../repositories';
import { sortData } from '../utils';
import { applyDateFilters } from '../utils/filters';
import { TrendAnalyticsService } from './trend-analytics.service';
import { LocationAnalyticsEntity } from '../entities';

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
    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    // Extract unique country codes first
    const uniqueCountryCodes = new Set<string>();
    alumnus.forEach((a) => {
      (a.roles || []).forEach((role) => {
        const countryCode = role.location?.countryCode;
        if (countryCode) {
          uniqueCountryCodes.add(countryCode);
        }
      });
    });

    // Fetch all country coordinates in a single query
    const countryCoordinatesMap: Map<string, LocationAnalyticsEntity> =
      await this.locationRepository.getCountriesCoordinates(
        Array.from(uniqueCountryCodes),
      );

    // Process roles and count alumni per country
    const { entityMap } = this.groupByGeoEntity(
      alumnus.flatMap((a) =>
        (a.roles || []).map((role) => {
          const countryCode = role.location?.countryCode;
          const countryCoordinates = countryCode
            ? countryCoordinatesMap.get(countryCode)
            : null;
          return {
            alumniId: a.id,
            location: role.location,
            countryCoordinates,
          };
        }),
      ),
      (role) => role.location?.countryCode || '',
      (role) => {
        const coords = role.countryCoordinates;
        return {
          name: role.location?.country || '',
          code: role.location?.countryCode || '',
          latitude: coords?.latitude ?? 0,
          longitude: coords?.longitude ?? 0,
        };
      },
      (role) => role.alumniId,
    );

    const countries: CountryListItemDto[] = Array.from(entityMap.entries())
      .filter(([code]) => code) // Filter out empty country codes
      .map(([code, data]) => ({
        id: code,
        name: data.name,
        code: data.code,
        count: data.count,
        trend: [],
        latitude: data.latitude,
        longitude: data.longitude,
      }));

    if (query.includeGeoTrend) {
      const trends = await Promise.all(
        countries.map((country) =>
          this.trendAnalyticsService.getCountryTrend({
            data: alumnusUnfiltered,
            type: TREND_TYPE.ALUMNI_COUNT,
            entityId: country.code,
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
    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    // Extract all roles with valid city information
    const roles = alumnus.flatMap((a) =>
      (a.roles || [])
        .filter((role) => role.location?.city && role.location?.id)
        .map((role) => ({
          alumniId: a.id,
          location: role.location!,
        })),
    );

    // Group by city in a single pass
    const { entityMap } = this.groupByGeoEntity(
      roles,
      (role) => role.location.id,
      (role) => ({
        name: role.location.city!,
        code: role.location.countryCode || '',
        latitude: role.location.latitude || 0,
        longitude: role.location.longitude || 0,
      }),
      (role) => role.alumniId,
    );

    const cities: CityListItemDto[] = Array.from(entityMap.entries())
      .filter(([cityId]) => cityId) // Filter out invalid IDs
      .map(([cityId, data]) => ({
        id: cityId,
        name: data.name,
        code: data.code,
        count: data.count,
        trend: [],
        latitude: data.latitude,
        longitude: data.longitude,
      }));

    if (query.includeGeoTrend) {
      const trends = await Promise.all(
        cities.map((city) =>
          this.trendAnalyticsService.getCityTrend({
            data: alumnusUnfiltered,
            entityId: city.id,
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
