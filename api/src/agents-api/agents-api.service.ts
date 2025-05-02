import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AgentsApiService {
  private readonly agentsApiUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.agentsApiUrl =
      this.configService.get<string>('AGENTS_API_URL') ||
      'http://localhost:8000';
  }

  async triggerLinkedinScrape(alumniId: string): Promise<void> {
    const alumni = await this.prisma.alumni.findUnique({
      where: { id: alumniId },
    });

    if (!alumni || !alumni.linkedinUrl) {
      throw new NotFoundException(
        'Alumni not found or LinkedIn URL not available',
      );
    }

    try {
      await axios.post(
        `${this.agentsApiUrl}/api/linkedin/extract-profile`,
        {
          profile_url: alumni.linkedinUrl,
          alumni_id: alumniId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.configService.get<string>('AGENTS_API_KEY'),
          },
        },
      );
    } catch (error: unknown) {
      console.error(
        'Error calling the API to extract LinkedIn profile:',
        error,
      );
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Failed to extract LinkedIn profile: ${
          axiosError.message || 'Unknown error'
        }`,
        axiosError.response?.status || 500,
      );
    }
  }

  async triggerLinkedinUpdate(alumniId: string): Promise<void> {
    const alumni = await this.prisma.alumni.findUnique({
      where: { id: alumniId },
    });

    if (!alumni || !alumni.linkedinUrl) {
      throw new NotFoundException(
        'Alumni not found or LinkedIn URL not available',
      );
    }

    try {
      await axios.post(
        `${this.agentsApiUrl}/api/linkedin/update-profile`,
        {
          profile_url: alumni.linkedinUrl,
          alumni_id: alumniId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.configService.get<string>('AGENTS_API_KEY'),
          },
        },
      );
    } catch (error: unknown) {
      console.error('Error calling the API to update LinkedIn profile:', error);
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Failed to update LinkedIn profile: ${
          axiosError.message || 'Unknown error'
        }`,
        axiosError.response?.status || 500,
      );
    }
  }
}
