import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { LinkedInOperation } from '@/consts';
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

  /**
   * Triggers a LinkedIn operation for a list of alumni
   * @param operation - The operation to trigger, one of `EXTRACT` or `UPDATE`
   * @param alumniIds - The list of alumni IDs to trigger the operation for
   */
  async triggerLinkedinOperation(
    operation: LinkedInOperation,
    alumniIds: string[],
  ): Promise<void> {
    try {
      await axios.post(
        `${this.agentsApiUrl}/api/linkedin/${operation}`,
        {
          alumni_ids: alumniIds,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.configService.get<string>('AGENTS_API_KEY'),
          },
        },
      );
    } catch (error: unknown) {
      console.error(`Error calling the API to ${operation}:`, error);
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Failed to ${operation}: ${axiosError.message || 'Unknown error'}`,
        axiosError.response?.status || 500,
      );
    }
  }
}
