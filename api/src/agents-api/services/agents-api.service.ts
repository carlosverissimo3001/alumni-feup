import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LINKEDIN_OPERATION } from '@/consts';
import { Configuration, LinkedInApi, ResponseError } from '@/sdk/agents-api';

@Injectable()
export class AgentsApiService {
  private readonly linkedInApi: LinkedInApi;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const agentsApiUrl =
      this.configService.get<string>('AGENTS_API_URL') ||
      'http://localhost:8000';

    this.linkedInApi = new LinkedInApi(
      new Configuration({
        basePath: agentsApiUrl,
        headers: {
          'X-API-Key': this.configService.get<string>('AGENTS_API_KEY') ?? '',
        },
      }),
    );
  }

  /**
   * Triggers a LinkedIn operation for a list of alumni
   * @param operation - The operation to trigger, one of `EXTRACT` or `UPDATE`
   * @param alumniIds - The list of alumni IDs to trigger the operation for
   */
  async triggerLinkedinOperation(
    operation: LINKEDIN_OPERATION,
    alumniIds: string[],
  ): Promise<void> {
    try {
      if (operation === LINKEDIN_OPERATION.EXTRACT) {
        await this.linkedInApi.extractLinkedinProfilesApiLinkedinExtractProfilePost(
          { linkedInExtractProfileRequest: { alumniIds } },
        );
      } else {
        await this.linkedInApi.updateLinkedinProfilesApiLinkedinUpdateProfilePost(
          { linkedInUpdateProfileRequest: { alumniIds } },
        );
      }
    } catch (error: unknown) {
      console.error(`Error calling the API to ${operation}:`, error);
      // The generated client throws ResponseError (non-2xx) wrapping the raw Response,
      // unlike axios's AxiosError with a parsed response object.
      if (error instanceof ResponseError) {
        throw new HttpException(
          `Failed to ${operation}: ${error.response.statusText || 'Unknown error'}`,
          error.response.status,
        );
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(`Failed to ${operation}: ${message}`, 500);
    }
  }
}
