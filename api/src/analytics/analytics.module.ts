import { Module } from '@nestjs/common';
import { CompaniesAnalyticsController } from './controllers/companies-analytics.controller';
import { CompanyAnalyticsService } from './services/company-analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyAnalyticsRepository } from './repositories/company.repository';
import { Logger } from '@nestjs/common';
import { AlumniAnalyticsRepository } from './repositories/alumni.repository';

@Module({
  controllers: [CompaniesAnalyticsController],
  providers: [
    CompanyAnalyticsService,
    PrismaService,
    CompanyAnalyticsRepository,
    AlumniAnalyticsRepository,
    Logger,
  ],
})
export class AnalyticsModule {}
