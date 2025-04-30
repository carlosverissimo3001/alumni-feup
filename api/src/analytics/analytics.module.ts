import { Logger, Module } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CompaniesAnalyticsController,
  CountriesAnalyticsController,
  IndustriesAnalyticsController,
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
} from '@/analytics/services';

@Module({
  controllers: [
    CompaniesAnalyticsController,
    CountriesAnalyticsController,
    IndustriesAnalyticsController,
  ],
  providers: [
    CompanyAnalyticsService,
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
