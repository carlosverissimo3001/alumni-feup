import { QueryParamsDto } from '../dto/query-params.dto';
import { AlumniAnalyticsRepository, LocationRepository } from '../repositories';
import { Injectable } from '@nestjs/common';
import { LogExecutionTime } from '@/decorators/log-execution-time.decorator';
import {
  CountryListResponseDto,
  CountryOptionDto,
  GetCitiesDto,
  CityListResponseDto,
  CityOptionDto,
  CityListItemDto,
  CountryListItemDto,
} from '@/analytics/dto';
import { TREND_TYPE } from '../consts';
import {
  DEFAULT_QUERY_LIMIT,
  DEFAULT_QUERY_OFFSET,
  DEFAULT_QUERY_SORT_BY,
  DEFAULT_QUERY_SORT_ORDER,
} from '../consts';
import { sortData } from '../utils';
import { applyDateFilters } from '../utils/filters';
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

  @LogExecutionTime()
  async getCountriesWithAlumniCount(
    query: QueryParamsDto,
  ): Promise<CountryListResponseDto> {
    const alumnusUnfiltered = await this.alumniRepository.find(query);

    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    const rolesWithCoords = await Promise.all(
      alumnus.flatMap((a) =>
        (a.roles || []).map(async (role) => {
          const countryCode = role.location?.countryCode;
          const countryCoordinates = countryCode
            ? await this.locationRepository.getCountryCoordinates(countryCode)
            : undefined;
          return {
            alumniId: a.id,
            location: role.location,
            countryCoordinates,
          };
        }),
      ),
    );

    const roles = rolesWithCoords.filter(
      (role) => role.location?.countryCode && role.countryCoordinates,
    );

    const { entityMap } = this.groupByGeoEntity(
      roles,
      (role) => role.location!.countryCode!,
      (role) => ({
        name: role.location!.country ?? '',
        code: role.location!.countryCode!,
        latitude: role.countryCoordinates!.latitude ?? 0,
        longitude: role.countryCoordinates!.longitude ?? 0,
      }),
      (role) => role.alumniId,
    );

    const countries: CountryListItemDto[] = Array.from(entityMap.entries()).map(
      ([code, data]) => ({
        id: code,
        name: data.name,
        code: data.code,
        count: data.count,
        trend: [],
        latitude: data.latitude,
        longitude: data.longitude,
      }),
    );

    if (query.includeTrend) {
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

  @LogExecutionTime()
  async getCitiesWithAlumniCount(
    query: QueryParamsDto,
  ): Promise<CityListResponseDto> {
    const alumnusUnfiltered = await this.alumniRepository.find(query);

    const alumnus = applyDateFilters(alumnusUnfiltered, query);

    const roles = alumnus
      .flatMap((a) =>
        (a.roles || []).map((role) => ({
          alumniId: a.id,
          location: role.location,
        })),
      )
      .filter((role) => role.location?.city);

    // Group by city in a single pass
    const { entityMap } = this.groupByGeoEntity(
      roles,
      (role) => role.location!.id,
      (role) => ({
        name: role.location!.city!,
        code: role.location!.countryCode ?? '',
        latitude: role.location!.latitude ?? 0,
        longitude: role.location!.longitude ?? 0,
      }),
      (role) => role.alumniId,
    );

    const cities: CityListItemDto[] = Array.from(entityMap.entries()).map(
      ([cityId, data]) => ({
        id: cityId,
        name: data.name,
        code: data.code,
        count: data.count,
        trend: [],
        latitude: data.latitude,
        longitude: data.longitude,
      }),
    );

    if (query.includeTrend) {
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

  @LogExecutionTime()
  async getCountriesOptions(): Promise<CountryOptionDto[]> {
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

  @LogExecutionTime()
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
