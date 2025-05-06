import { Logger, Module } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CompaniesAnalyticsController,
  CountriesAnalyticsController,
  IndustriesAnalyticsController,
  RoleAnalyticsController,
} from '@/analytics/controllers';
import {
  AlumniAnalyticsRepository,
  CompanyRepository,
  IndustryRepository,
  LocationRepository,
} from '@/analytics/repositories';
import {
  CompanyAnalyticsService,
  CountryAnalyticsService,
  RoleAnalyticsService,
} from '@/analytics/services';

@Module({
  controllers: [
    CompaniesAnalyticsController,
    CountriesAnalyticsController,
    IndustriesAnalyticsController,
    RoleAnalyticsController,
  ],
  providers: [
    CompanyAnalyticsService,
    RoleAnalyticsService,
    CountryAnalyticsService,
    PrismaService,
    AlumniAnalyticsRepository,
    LocationRepository,
    CompanyRepository,
    IndustryRepository,
    Logger,
  ],
})
export class AnalyticsModule {}
