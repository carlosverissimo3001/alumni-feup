import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module';
import { AgentsApiModule } from './agents-api/agents-api.module';
import { AlumniModule } from './alumni/alumni.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CompanyModule } from './company/company.module';
import { CourseModule } from './course/course.module';
import { FacultyModule } from './faculty/faculty.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { OtpModule } from './otp/otp.module';
import { UserModule } from './user/user.module';
import { ReviewModule } from './reviews/review.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10000,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    OtpModule,
    AdminModule,
    AlumniModule,
    AnalyticsModule,
    CompanyModule,
    UserModule,
    FileUploadModule,
    CourseModule,
    FacultyModule,
    AgentsApiModule,
    ReviewModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
