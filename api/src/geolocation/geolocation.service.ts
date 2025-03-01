import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { Location as GeoLocation } from 'src/entities/location.entity';
import { GeoLocationApiResponse, JobReturn } from 'src/consts';

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

  // Fetches locations from the database that don't have coordinates and adds them to the database
  async extractCoordinates() {
    try {
      // Find locations without coordinates
      const locationsWithoutCoordinates = await this.prisma.location.findMany({
        where: {
          OR: [{ latitude: null }, { longitude: null }],
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

      return this.getOperationStatus(
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

  private getOperationStatus(
    successCount: number,
    failureCount: number,
  ): JobReturn {
    if (failureCount > 0) {
      return {
        status: 'error',
        message:
          'Some or all locations failed to update - Please review them manually -> `problematic_location` table',
      };
    }
    return {
      status: 'success',
      message: `Successfully updated all ${successCount} locations`,
    };
  }

  private async getCoordinatesFromApi(
    city: string,
    country: string,
  ): Promise<{ lat: number; lon: number } | null> {
    try {
      const response = await axios.get(
        `${this.baseURL}${encodeURIComponent(city)},${encodeURIComponent(country)}&limit=1&appid=${this.apiKey}`,
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
}
