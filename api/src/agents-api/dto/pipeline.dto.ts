import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum PipelineKind {
  REFRESH_EXISTING = 'REFRESH_EXISTING',
  INGEST_COHORT = 'INGEST_COHORT',
}

export enum PipelineTrigger {
  ADMIN_UI = 'ADMIN_UI',
  API = 'API',
  SCHEDULE = 'SCHEDULE',
}

export enum PipelineRunStatus {
  PLANNING = 'PLANNING',
  PLANNED = 'PLANNED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum PipelineStageName {
  PLAN = 'PLAN',
  LINKEDIN = 'LINKEDIN',
  COMPANY = 'COMPANY',
  CLASSIFY_ROLES = 'CLASSIFY_ROLES',
  SENIORITY = 'SENIORITY',
  LOCATION = 'LOCATION',
}

export enum PipelineStageStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export enum PipelineTaskStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export enum PipelineEntityType {
  ALUMNI = 'ALUMNI',
  ROLE = 'ROLE',
  COMPANY = 'COMPANY',
  LOCATION = 'LOCATION',
}

export class TaskCountsOutDto {
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

export class StageSummaryDto {
  @ApiProperty({ enum: PipelineStageName })
  stage: PipelineStageName;

  @ApiProperty()
  sequence: number;

  @ApiProperty({ enum: PipelineStageStatus })
  status: PipelineStageStatus;

  @ApiProperty()
  total_count: number;

  @ApiProperty()
  succeeded_count: number;

  @ApiProperty()
  failed_count: number;

  @ApiProperty()
  skipped_count: number;

  @ApiPropertyOptional()
  started_at?: string | null;

  @ApiPropertyOptional()
  finished_at?: string | null;

  @ApiPropertyOptional()
  error?: string | null;
}

export class RunSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: PipelineKind })
  kind: PipelineKind;

  @ApiProperty({ enum: PipelineRunStatus })
  status: PipelineRunStatus;

  @ApiProperty({ enum: PipelineTrigger })
  trigger_source: PipelineTrigger;

  @ApiPropertyOptional()
  triggered_by?: string | null;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  params?: Record<string, unknown> | null;

  @ApiProperty()
  created_at: string;

  @ApiPropertyOptional()
  started_at?: string | null;

  @ApiPropertyOptional()
  finished_at?: string | null;

  @ApiPropertyOptional()
  error?: string | null;

  @ApiProperty({ type: TaskCountsOutDto })
  counts: TaskCountsOutDto;
}

export class RunDetailDto extends RunSummaryDto {
  @ApiProperty({ type: [StageSummaryDto] })
  stages: StageSummaryDto[];
}

export class TaskSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: PipelineEntityType })
  entity_type: PipelineEntityType;

  @ApiProperty()
  entity_id: string;

  @ApiProperty({ enum: PipelineTaskStatus })
  status: PipelineTaskStatus;

  @ApiProperty()
  attempts: number;

  @ApiPropertyOptional()
  error?: string | null;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  result?: Record<string, unknown> | null;

  @ApiPropertyOptional()
  started_at?: string | null;

  @ApiPropertyOptional()
  finished_at?: string | null;
}

export class RunsPageDto {
  @ApiProperty({ type: [RunSummaryDto] })
  items: RunSummaryDto[];

  @ApiPropertyOptional()
  next_cursor?: string;
}

export class TasksPageDto {
  @ApiProperty({ type: [TaskSummaryDto] })
  items: TaskSummaryDto[];

  @ApiPropertyOptional()
  next_cursor?: string;
}

export class ListPipelineRunsQueryDto {
  @ApiPropertyOptional({ enum: PipelineKind })
  @IsOptional()
  @IsEnum(PipelineKind)
  kind?: PipelineKind;

  @ApiPropertyOptional({ enum: PipelineRunStatus })
  @IsOptional()
  @IsEnum(PipelineRunStatus)
  status?: PipelineRunStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;
}

export class ListPipelineRunTasksQueryDto {
  @ApiPropertyOptional({ enum: PipelineTaskStatus })
  @IsOptional()
  @IsEnum(PipelineTaskStatus)
  status?: PipelineTaskStatus;

  @ApiPropertyOptional({ enum: PipelineStageName })
  @IsOptional()
  @IsEnum(PipelineStageName)
  stage?: PipelineStageName;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  limit?: number;
}
