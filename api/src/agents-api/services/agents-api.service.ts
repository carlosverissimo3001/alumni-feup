import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LINKEDIN_OPERATION } from '@/consts';
import {
  Configuration,
  LinkedInApi,
  PageRunSummary,
  PageTaskSummary,
  PipelineKind,
  PipelineRunStatus,
  PipelineStageName,
  PipelineTaskStatus,
  PipelineTrigger,
  PipelinesApi,
  ResponseError,
  RunCreated,
  RunDetail,
} from '@/sdk/agents-api';

@Injectable()
export class AgentsApiService {
  private readonly linkedInApi: LinkedInApi;
  private readonly pipelinesApi: PipelinesApi;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const agentsApiUrl =
      this.configService.get<string>('AGENTS_API_URL') ||
      'http://localhost:8000';

    const configuration = new Configuration({
      basePath: agentsApiUrl,
      headers: {
        'X-API-Key': this.configService.get<string>('AGENTS_API_KEY') ?? '',
      },
    });

    this.linkedInApi = new LinkedInApi(configuration);
    this.pipelinesApi = new PipelinesApi(configuration);
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

  /**
   * Creates a pipeline run for a batch of alumni and starts it immediately
   * (mirrors the generated client's own createPipelineRunApiPipelinesKindRunsPost,
   * scoped to the one kind/trigger this backend ever creates runs for).
   */
  async createPipelineRun(
    alumniIds: string[],
    triggeredBy?: string,
    label?: string,
  ): Promise<RunCreated> {
    try {
      return await this.pipelinesApi.createPipelineRunApiPipelinesKindRunsPost({
        kind: PipelineKind.IngestCohort,
        createRunRequest: {
          alumniIds: alumniIds.join(','),
          triggerSource: PipelineTrigger.AdminUi,
          triggeredBy,
          label,
        },
      });
    } catch (error: unknown) {
      this.handlePipelinesError('create pipeline run', error);
    }
  }

  /**
   * Lists pipeline runs, optionally filtered by kind/status, cursor-paginated
   */
  async listPipelineRuns(params: {
    kind?: PipelineKind;
    status?: PipelineRunStatus;
    cursor?: string;
    limit?: number;
  }): Promise<PageRunSummary> {
    try {
      return await this.pipelinesApi.listRunsApiPipelinesRunsGet({
        kind: params.kind,
        status: params.status,
        cursor: params.cursor,
        limit: params.limit,
      });
    } catch (error: unknown) {
      this.handlePipelinesError('list pipeline runs', error);
    }
  }

  /**
   * Gets the detail of a single pipeline run, including its stages
   */
  async getPipelineRun(runId: string): Promise<RunDetail> {
    try {
      return await this.pipelinesApi.getRunApiPipelinesRunsRunIdGet({ runId });
    } catch (error: unknown) {
      this.handlePipelinesError('get pipeline run', error);
    }
  }

  /**
   * Lists the tasks of a pipeline run, optionally filtered by status/stage, cursor-paginated
   */
  async listPipelineRunTasks(
    runId: string,
    params: {
      status?: PipelineTaskStatus;
      stage?: PipelineStageName;
      cursor?: string;
      limit?: number;
    },
  ): Promise<PageTaskSummary> {
    try {
      return await this.pipelinesApi.listRunTasksApiPipelinesRunsRunIdTasksGet(
        {
          runId,
          status: params.status,
          stage: params.stage,
          cursor: params.cursor,
          limit: params.limit,
        },
      );
    } catch (error: unknown) {
      this.handlePipelinesError('list pipeline run tasks', error);
    }
  }

  // Mirrors the ResponseError-vs-generic-Error handling in triggerLinkedinOperation above;
  // always throws, so callers rely on TS's control-flow narrowing after calling it.
  private handlePipelinesError(action: string, error: unknown): never {
    console.error(`Error calling the API to ${action}:`, error);
    if (error instanceof ResponseError) {
      throw new HttpException(
        `Failed to ${action}: ${error.response.statusText || 'Unknown error'}`,
        error.response.status,
      );
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new HttpException(`Failed to ${action}: ${message}`, 500);
  }
}
