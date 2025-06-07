import {
  AnalyticsController,
  CompanyAnalyticsController,
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
import { CourseModule } from '@/course/course.module';
import { FacultyModule } from '@/faculty/faculty.module';

@Module({
  imports: [CourseModule, FacultyModule],
  controllers: [
    CompanyAnalyticsController,
    RoleAnalyticsController,
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
