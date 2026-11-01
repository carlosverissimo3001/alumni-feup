import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  PageRunSummary,
  PageTaskSummary,
  PipelineEntityType,
  PipelineKind,
  PipelineRunStatus,
  PipelineStageName,
  PipelineStageStatus,
  PipelineTaskStatus,
  PipelineTrigger,
  RunDetail,
  RunSummary,
  StageSummary,
  TaskCountsOut,
  TaskSummary,
} from '@/sdk/agents-api';

export class ListPipelineRunsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by pipeline kind', enum: PipelineKind })
  @IsOptional()
  @IsEnum(PipelineKind)
  kind?: PipelineKind;

  @ApiPropertyOptional({ description: 'Filter by run status', enum: PipelineRunStatus })
  @IsOptional()
  @IsEnum(PipelineRunStatus)
  status?: PipelineRunStatus;

  @ApiPropertyOptional({ description: 'Pagination cursor' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Max number of items to return' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class ListPipelineRunTasksQueryDto {
  @ApiPropertyOptional({ description: 'Filter by task status', enum: PipelineTaskStatus })
  @IsOptional()
  @IsEnum(PipelineTaskStatus)
  status?: PipelineTaskStatus;

  @ApiPropertyOptional({ description: 'Filter by stage', enum: PipelineStageName })
  @IsOptional()
  @IsEnum(PipelineStageName)
  stage?: PipelineStageName;

  @ApiPropertyOptional({ description: 'Pagination cursor' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Max number of items to return' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class TaskCountsOutDto implements TaskCountsOut {
  @ApiProperty()
  total: number;

  @ApiProperty()
  succeeded: number;

  @ApiProperty()
  failed: number;

  @ApiProperty()
  skipped: number;

  @ApiProperty()
  pending: number;
}

export class StageSummaryDto implements StageSummary {
  @ApiProperty({ enum: PipelineStageName })
  stage: PipelineStageName;

  @ApiProperty()
  sequence: number;

  @ApiProperty({ enum: PipelineStageStatus })
  status: PipelineStageStatus;

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  succeededCount: number;

  @ApiProperty()
  failedCount: number;

  @ApiProperty()
  skippedCount: number;

  @ApiProperty({ nullable: true, type: Date })
  startedAt: Date | null;

  @ApiProperty({ nullable: true, type: Date })
  finishedAt: Date | null;

  @ApiProperty({ nullable: true, type: String })
  error: string | null;
}

export class RunSummaryDto implements RunSummary {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: PipelineKind, nullable: true })
  kind: PipelineKind | null;

  @ApiProperty({ enum: PipelineRunStatus })
  status: PipelineRunStatus;

  @ApiProperty({ enum: PipelineTrigger })
  triggerSource: PipelineTrigger;

  @ApiProperty({ nullable: true, type: String })
  triggeredBy: string | null;

  @ApiProperty({ nullable: true, type: 'object', additionalProperties: true })
  params: Record<string, any> | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ nullable: true, type: Date })
  startedAt: Date | null;

  @ApiProperty({ nullable: true, type: Date })
  finishedAt: Date | null;

  @ApiProperty({ nullable: true, type: String })
  error: string | null;

  @ApiProperty({ type: TaskCountsOutDto })
  counts: TaskCountsOut;
}

export class RunDetailDto implements RunDetail {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: PipelineKind })
  kind: PipelineKind;

  @ApiProperty({ enum: PipelineRunStatus })
  status: PipelineRunStatus;

  @ApiProperty({ enum: PipelineTrigger })
  triggerSource: PipelineTrigger;

  @ApiProperty({ nullable: true, type: String })
  triggeredBy: string | null;

  @ApiProperty({ nullable: true, type: 'object', additionalProperties: true })
  params: Record<string, any> | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ nullable: true, type: Date })
  startedAt: Date | null;

  @ApiProperty({ nullable: true, type: Date })
  finishedAt: Date | null;

  @ApiProperty({ nullable: true, type: String })
  error: string | null;

  @ApiProperty({ type: TaskCountsOutDto })
  counts: TaskCountsOut;

  @ApiProperty({ type: StageSummaryDto, isArray: true })
  stages: Array<StageSummary>;
}

export class TaskSummaryDto implements TaskSummary {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: PipelineStageName })
  stage: PipelineStageName;

  @ApiProperty({ enum: PipelineEntityType })
  entityType: PipelineEntityType;

  @ApiProperty()
  entityId: string;

  @ApiProperty({ enum: PipelineTaskStatus })
  status: PipelineTaskStatus;

  @ApiProperty()
  attempts: number;

  @ApiProperty({ nullable: true, type: String })
  error: string | null;

  @ApiProperty({ nullable: true, type: 'object', additionalProperties: true })
  result: Record<string, any> | null;

  @ApiProperty({ nullable: true, type: Date })
  startedAt: Date | null;

  @ApiProperty({ nullable: true, type: Date })
  finishedAt: Date | null;
}

export class PageRunSummaryDto implements PageRunSummary {
  @ApiProperty({ type: RunSummaryDto, isArray: true })
  items: Array<RunSummary>;

  @ApiPropertyOptional({ nullable: true, type: String })
  nextCursor?: string | null;
}

export class PageTaskSummaryDto implements PageTaskSummary {
  @ApiProperty({ type: TaskSummaryDto, isArray: true })
  items: Array<TaskSummary>;

  @ApiPropertyOptional({ nullable: true, type: String })
  nextCursor?: string | null;
}
