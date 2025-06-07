import {
  AnalyticsController,
  CompanyAnalyticsController,
  GeoAnalyticsController,
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
  IndustryAnalyticsService,
  RoleAnalyticsService,
  SeniorityAnalyticsService,
  TrendAnalyticsService,
} from '@/analytics/services';
import { PrismaService } from '@/prisma/prisma.service';
import { Logger, Module } from '@nestjs/common';
import { AlumniAnalyticsController } from './controllers/alumni-analytics.controller';
import { CourseModule } from '@/course/course.module';
import { FacultyModule } from '@/faculty/faculty.module';

@Module({
  imports: [CourseModule, FacultyModule],
  controllers: [
    CompanyAnalyticsController,
    GeoAnalyticsController,
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
    IndustryAnalyticsService,
    SeniorityAnalyticsService,
    AnalyticsService,
  ],
})
export class AnalyticsModule {}
