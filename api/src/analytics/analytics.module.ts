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
} from '@/analytics/services';

@Module({
  controllers: [
    CompanyAnalyticsController,
    GeoAnalyticsController,
    IndustryAnalyticsController,
    RoleAnalyticsController,
  ],
  providers: [
    CompanyAnalyticsService,
    RoleAnalyticsService,
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
