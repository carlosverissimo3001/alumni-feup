import { RequirePermission, UserAuthGuard } from '@/auth/user-auth.guard';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ListPipelineRunsQueryDto,
  ListPipelineRunTasksQueryDto,
  RunDetailDto,
  RunsPageDto,
  TasksPageDto,
} from '../dto/pipeline.dto';
import { AgentsApiService } from '../services/agents-api.service';

@ApiTags('V1')
@Controller('admin/pipelines')
@SkipThrottle()
@UseGuards(UserAuthGuard)
export class PipelinesController {
  constructor(private readonly agentsApiService: AgentsApiService) {}

  @Get('runs')
  @RequirePermission('admin', 'read')
  @ApiOperation({ summary: 'List pipeline runs' })
  @ApiResponse({ status: 200, description: 'Paginated pipeline runs', type: RunsPageDto })
  async listRuns(
    @Query() query: ListPipelineRunsQueryDto,
  ): Promise<RunsPageDto> {
    return this.agentsApiService.listPipelineRuns(query);
  }

  @Get('runs/:runId')
  @RequirePermission('admin', 'read')
  @ApiOperation({ summary: 'Get a pipeline run, including its stages' })
  @ApiResponse({ status: 200, description: 'Pipeline run detail', type: RunDetailDto })
  async getRun(@Param('runId') runId: string): Promise<RunDetailDto> {
    return this.agentsApiService.getPipelineRun(runId);
  }

  @Get('runs/:runId/tasks')
  @RequirePermission('admin', 'read')
  @ApiOperation({ summary: 'List the tasks in a pipeline run' })
  @ApiResponse({ status: 200, description: 'Paginated pipeline run tasks', type: TasksPageDto })
  async listRunTasks(
    @Param('runId') runId: string,
    @Query() query: ListPipelineRunTasksQueryDto,
  ): Promise<TasksPageDto> {
    return this.agentsApiService.listPipelineRunTasks(runId, query);
  }
}
