import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { LocationAnalyticsEntity } from '../entities';
import { mapLocationFromPrisma } from '../utils/mapper';

@Injectable()
export class LocationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<LocationAnalyticsEntity[]> {
    const locations = await this.prismaService.location.findMany({
      where: {
        countryCode: {
          not: null,
        },
        country: {
          not: null,
        },
      },
    });

    const mappedLocations = locations.map(mapLocationFromPrisma);

    return mappedLocations.filter((location) => location !== undefined);
  }

  async countCountries(): Promise<number> {
    const countries = await this.prismaService.location.groupBy({
      by: ['countryCode'],
      where: {
        countryCode: { not: null },
      },
      _count: {
        _all: true,
      },
    });

    return countries.length;
  }

  /**
   * Counts all the cities in the database
   * @returns The number of cities in the database
   */
  async countCities() {
    // Note: It's highly unlikely that 2 cities in the same country have the same name
    // So we can deduplicate the cities by country
    return await this.prismaService.location.count({
      where: {
        city: { not: null },
      },
    });
  }

  async getCities(countryCodes?: string[]): Promise<LocationAnalyticsEntity[]> {
    const cities = await this.prismaService.location.findMany({
      where: {
        ...(countryCodes && { countryCode: { in: countryCodes } }),
        city: { not: null },
      },
    });

    const mappedLocations = cities.map(mapLocationFromPrisma);

    return mappedLocations.filter((location) => location !== undefined);
  }

  /**
   * In the DB, we have an entry foe every country, whose city name is "Other - {country}"
   * and coordinate point to the geographic center of the country.
   * @param countryCode
   */
  async getCountryCoordinates(
    countryCode: string,
  ): Promise<LocationAnalyticsEntity | undefined> {
    const country = await this.prismaService.location.findFirst({
      where: {
        isCountryOnly: true,
        countryCode,
      },
    });

    return mapLocationFromPrisma(country);
  }
}
