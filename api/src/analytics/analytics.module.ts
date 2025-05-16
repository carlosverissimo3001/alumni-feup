import { Logger, Module } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CompanyAnalyticsController,
  GeoAnalyticsController,
  IndustryAnalyticsController,
  RoleAnalyticsController,
} from '@/analytics/controllers';
import {
  AlumniAnalyticsRepository,
  CompanyRepository,
  IndustryRepository,
  LocationRepository,
  RoleRepository,
} from '@/analytics/repositories';
import {
  CompanyAnalyticsService,
  GeoAnalyticsService,
  RoleAnalyticsService,
  TrendAnalyticsService,
  AlumniAnalyticsService,
} from '@/analytics/services';
import { AlumniAnalyticsController } from './controllers/alumni-analytics.controller';

@Module({
  controllers: [
    CompanyAnalyticsController,
    GeoAnalyticsController,
    IndustryAnalyticsController,
    RoleAnalyticsController,
    AlumniAnalyticsController,
  ],
  providers: [
    CompanyAnalyticsService,
    RoleAnalyticsService,
    AlumniAnalyticsService,
    GeoAnalyticsService,
    PrismaService,
    AlumniAnalyticsRepository,
    LocationRepository,
    CompanyRepository,
    IndustryRepository,
    RoleRepository,
    Logger,
    TrendAnalyticsService,
  ],
})
export class AnalyticsModule {}
