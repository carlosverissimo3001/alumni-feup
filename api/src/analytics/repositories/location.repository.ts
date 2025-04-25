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
