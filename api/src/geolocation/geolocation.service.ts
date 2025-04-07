import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { GeoLocationApiResponse } from 'src/consts';
import { getOperationStatus } from './utils';

@Injectable()
export class GeolocationService {
  private readonly baseURL: string | undefined;
  private readonly apiKey: string | undefined;
  private readonly logger = new Logger(GeolocationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.baseURL = this.configService.get<string>('GEOLOCATION_BASE_URL');
    this.apiKey = this.configService.get<string>('GEOLOCATION_API_KEY');

    if (!this.baseURL || !this.apiKey) {
      this.logger.error(
        'GEOLOCATION_BASE_URL or GEOLOCATION_API_KEY is not set',
      );
      throw new Error('GEOLOCATION_BASE_URL or GEOLOCATION_API_KEY is not set');
    }
  }

  /**
   * Call a 3rd party API to extract coordinates for locations without coordinates in the database
   * @returns The status of the operation:
   * - success: if all locations were updated
   * - error: if some locations were not updated
   */
  async findMissingCoordinates() {
    try {
      // Find locations without coordinates
      const locationsWithoutCoordinates = await this.prisma.location.findMany({
        where: {
          OR: [{ latitude: null }, { longitude: null }],
          AND: [{ isCountryOnly: false }],
        },
      });

      if (locationsWithoutCoordinates.length === 0) {
        return {
          status: 'success',
          message: 'No locations without coordinates found',
        };
      }

      const successfulUpdates: string[] = [];
      const failedLocations: string[] = [];

      for (const location of locationsWithoutCoordinates) {
        try {
          const coordinates = await this.getCoordinatesFromApi(
            location.city,
            location.country,
          );

          if (coordinates?.lat && coordinates?.lon) {
            await this.prisma.location.update({
              where: { id: location.id },
              data: {
                latitude: coordinates.lat,
                longitude: coordinates.lon,
              },
            });
            successfulUpdates.push(location.id);
          } else {
            await this.prisma.problematicLocation.create({
              data: {
                location_id: location.id,
              },
            });
            failedLocations.push(location.id);
          }
        } catch (locationError) {
          this.logger.warn(
            `Failed to process location ${location.id}: ${locationError instanceof Error ? locationError.message : 'Unknown error'}`,
          );
          failedLocations.push(location.id);
        }
      }

      return getOperationStatus(
        successfulUpdates.length,
        failedLocations.length,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to extract coordinates: ${errorMessage}`);
      throw new Error(`Failed to extract coordinates: ${errorMessage}`);
    }
  }

  /** Calls a 3rd party API to extract coordinates for a given city and country pair
   * @param {string} city - The city to extract coordinates for
   * @param {string} country - The country to extract coordinates for
   * @returns The coordinates of the location
   */
  private async getCoordinatesFromApi(
    city?: string | null,
    country?: string | null,
  ): Promise<{ lat: number; lon: number } | null> {
    try {
      const response = await axios.get(
        `${this.baseURL}${encodeURIComponent(city ?? '')},${encodeURIComponent(country ?? '')}&limit=1&appid=${this.apiKey}`,
      );

      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const location = response.data[0] as GeoLocationApiResponse;
        return { lat: location.lat, lon: location.lon };
      }
      return null;
    } catch (error) {
      this.logger.error(
        `OpenWeatherMap API error: ${(error as Error).message}`,
      );
      return null;
    }
  }

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
