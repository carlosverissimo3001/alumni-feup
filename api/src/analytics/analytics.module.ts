import {
  AnalyticsController,
  CompanyAnalyticsController,
  GeoAnalyticsController,
  IndustryAnalyticsController,
  RoleAnalyticsController,
} from '@/analytics/controllers';
import {
  AlumniAnalyticsRepository,
  CompanyRepository,
  EducationRepository,
  IndustryRepository,
  LocationRepository,
  RoleRepository,
} from '@/analytics/repositories';
import {
  AlumniAnalyticsService,
  AnalyticsService,
  CompanyAnalyticsService,
  EducationAnalyticsService,
  GeoAnalyticsService,
  RoleAnalyticsService,
  SeniorityAnalyticsService,
  TrendAnalyticsService,
} from '@/analytics/services';
import { PrismaService } from '@/prisma/prisma.service';
import { Logger, Module } from '@nestjs/common';
import { AlumniAnalyticsController } from './controllers/alumni-analytics.controller';

@Module({
  controllers: [
    CompanyAnalyticsController,
    GeoAnalyticsController,
    IndustryAnalyticsController,
    RoleAnalyticsController,
    AlumniAnalyticsController,
    AnalyticsController,
  ],
  providers: [
    PrismaService,
    Logger,
    AlumniAnalyticsRepository,
    LocationRepository,
    CompanyRepository,
    EducationRepository,
    IndustryRepository,
    RoleRepository,
    TrendAnalyticsService,
    CompanyAnalyticsService,
    RoleAnalyticsService,
    EducationAnalyticsService,
    AlumniAnalyticsService,
    GeoAnalyticsService,
    SeniorityAnalyticsService,
    AnalyticsService,
  ],
})
export class AnalyticsModule {}
