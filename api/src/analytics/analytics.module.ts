import { Logger, Module } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CompanyAnalyticsController,
  GeoAnalyticsController,
  IndustryAnalyticsController,
  EducationAnalyticsController,
  RoleAnalyticsController,
} from '@/analytics/controllers';
import {
  AlumniAnalyticsRepository,
  CompanyRepository,
  IndustryRepository,
  LocationRepository,
  EducationRepository,
  RoleRepository,
} from '@/analytics/repositories';
import {
  CompanyAnalyticsService,
  GeoAnalyticsService,
  RoleAnalyticsService,
  TrendAnalyticsService,
  AlumniAnalyticsService,
  EducationAnalyticsService,
  SeniorityAnalyticsService,
} from '@/analytics/services';
import { AlumniAnalyticsController } from './controllers/alumni-analytics.controller';

@Module({
  controllers: [
    CompanyAnalyticsController,
    GeoAnalyticsController,
    IndustryAnalyticsController,
    EducationAnalyticsController,
    RoleAnalyticsController,
    AlumniAnalyticsController,
  ],
  providers: [
    CompanyAnalyticsService,
    RoleAnalyticsService,
    EducationAnalyticsService,
    AlumniAnalyticsService,
    GeoAnalyticsService,
    PrismaService,
    AlumniAnalyticsRepository,
    LocationRepository,
    CompanyRepository,
    EducationRepository,
    IndustryRepository,
    RoleRepository,
    Logger,
    TrendAnalyticsService,
    SeniorityAnalyticsService,
  ],
})
export class AnalyticsModule {}
