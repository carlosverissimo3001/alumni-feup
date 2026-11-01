import { RequirePermission, UserAuthGuard } from '@/auth/user-auth.guard';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ListPipelineRunsQueryDto,
  ListPipelineRunTasksQueryDto,
  PageRunSummaryDto,
  PageTaskSummaryDto,
  RunDetailDto,
} from '../dto/pipeline.dto';
import { AgentsApiService } from '../services/agents-api.service';

@ApiTags('V1')
@Controller('admin/pipelines')
@UseGuards(UserAuthGuard)
export class PipelinesController {
  constructor(private readonly agentsApiService: AgentsApiService) {}

  @Get('runs')
  @RequirePermission('admin', 'read')
  @ApiOperation({ summary: 'List pipeline runs' })
  @ApiResponse({
    status: 200,
    description: 'A page of pipeline runs',
    type: PageRunSummaryDto,
  })
  async listRuns(@Query() query: ListPipelineRunsQueryDto) {
    return this.agentsApiService.listPipelineRuns(query);
  }

  @Get('runs/:runId')
  @RequirePermission('admin', 'read')
  @ApiOperation({ summary: 'Get a pipeline run, including its stages' })
  @ApiResponse({
    status: 200,
    description: 'The pipeline run detail',
    type: RunDetailDto,
  })
  async getRun(@Param('runId') runId: string) {
    return this.agentsApiService.getPipelineRun(runId);
  }

  @Get('runs/:runId/tasks')
  @RequirePermission('admin', 'read')
  @ApiOperation({ summary: 'List the tasks of a pipeline run' })
  @ApiResponse({
    status: 200,
    description: 'A page of pipeline run tasks',
    type: PageTaskSummaryDto,
  })
  async listRunTasks(
    @Param('runId') runId: string,
    @Query() query: ListPipelineRunTasksQueryDto,
  ) {
    return this.agentsApiService.listPipelineRunTasks(runId, query);
  }
}
