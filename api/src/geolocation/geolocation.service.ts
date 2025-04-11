import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GeolocationService {
  private readonly logger = new Logger(GeolocationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Given a country, it returns the coordinates marking its center
   * @param country - The country to get the coordinates for
   * @returns The coordinates of the country center
   */
  async getCountryCoordinatesFromDatabase(
    country: string,
  ): Promise<{ lat: number; lon: number }> {
    const coords = await this.prisma.location.findFirst({
      where: {
        country: country,
        // This is a flag to indicate that the location is a country only (coords point to the center of the country)
        isCountryOnly: true,
      },
    });

    if (!coords?.latitude || !coords?.longitude) {
      throw new Error(`No coordinates found for country: ${country}`);
    }

    return { lat: coords.latitude, lon: coords.longitude };
  }
}
