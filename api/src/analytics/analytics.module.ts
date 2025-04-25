import { Logger, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CompaniesAnalyticsController,
  CountriesAnalyticsController,
} from './controllers';
import { AlumniAnalyticsRepository, LocationRepository } from './repositories';
import { CompanyAnalyticsService, CountryAnalyticsService } from './services';

@Module({
  controllers: [CompaniesAnalyticsController, CountriesAnalyticsController],
  providers: [
    CompanyAnalyticsService,
    CountryAnalyticsService,
    PrismaService,
    AlumniAnalyticsRepository,
    LocationRepository,
    Logger,
  ],
})
export class AnalyticsModule {}
