import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class LocationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
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

    return locations;
  }

  async countCountries() {
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

  async getCities(countryCodes?: string[]) {
    const cities = await this.prismaService.location.findMany({
      where: {
        ...(countryCodes && { countryCode: { in: countryCodes } }),
        city: { not: null },
      },
    });

    return cities;
  }
}
