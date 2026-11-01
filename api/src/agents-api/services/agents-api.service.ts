import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { LINKEDIN_OPERATION } from '@/consts';
import {
  ListPipelineRunsQueryDto,
  ListPipelineRunTasksQueryDto,
  RunDetailDto,
  RunsPageDto,
  TasksPageDto,
} from '../dto/pipeline.dto';

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
    operation: LINKEDIN_OPERATION,
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

  /**
   * Lists pipeline runs, paginated by the agents-api.
   */
  async listPipelineRuns(
    params: ListPipelineRunsQueryDto,
  ): Promise<RunsPageDto> {
    try {
      const response = await axios.get<RunsPageDto>(
        `${this.agentsApiUrl}/api/pipelines/runs`,
        {
          params,
          headers: {
            'X-API-Key': this.configService.get<string>('AGENTS_API_KEY'),
          },
        },
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error listing pipeline runs:', error);
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Failed to list pipeline runs: ${axiosError.message || 'Unknown error'}`,
        axiosError.response?.status || 500,
      );
    }
  }

  /**
   * Fetches the detail of a single pipeline run, including its stages.
   */
  async getPipelineRun(runId: string): Promise<RunDetailDto> {
    try {
      const response = await axios.get<RunDetailDto>(
        `${this.agentsApiUrl}/api/pipelines/runs/${runId}`,
        {
          headers: {
            'X-API-Key': this.configService.get<string>('AGENTS_API_KEY'),
          },
        },
      );
      return response.data;
    } catch (error: unknown) {
      console.error(`Error fetching pipeline run ${runId}:`, error);
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Failed to fetch pipeline run: ${axiosError.message || 'Unknown error'}`,
        axiosError.response?.status || 500,
      );
    }
  }

  /**
   * Lists the tasks within a pipeline run, paginated by the agents-api.
   */
  async listPipelineRunTasks(
    runId: string,
    params: ListPipelineRunTasksQueryDto,
  ): Promise<TasksPageDto> {
    try {
      const response = await axios.get<TasksPageDto>(
        `${this.agentsApiUrl}/api/pipelines/runs/${runId}/tasks`,
        {
          params,
          headers: {
            'X-API-Key': this.configService.get<string>('AGENTS_API_KEY'),
          },
        },
      );
      return response.data;
    } catch (error: unknown) {
      console.error(`Error listing tasks for pipeline run ${runId}:`, error);
      const axiosError = error as AxiosError;
      throw new HttpException(
        `Failed to list pipeline run tasks: ${axiosError.message || 'Unknown error'}`,
        axiosError.response?.status || 500,
      );
    }
  }
}
