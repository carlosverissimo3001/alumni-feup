import { Logger, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CompaniesAnalyticsController,
  CountriesAnalyticsController,
} from './controllers';
import {
  AlumniAnalyticsRepository,
  CompanyAnalyticsRepository,
} from './repositories';
import { CompanyAnalyticsService, CountryAnalyticsService } from './services';

@Module({
  controllers: [CompaniesAnalyticsController, CountriesAnalyticsController],
  providers: [
    CompanyAnalyticsService,
    CountryAnalyticsService,
    PrismaService,
    CompanyAnalyticsRepository,
    AlumniAnalyticsRepository,
    Logger,
  ],
})
export class AnalyticsModule {}
