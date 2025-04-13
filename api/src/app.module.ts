import { Module } from '@nestjs/common';
import { AlumniModule } from './alumni/alumni.module';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { ConfigModule } from '@nestjs/config';
import { CourseModule } from './course/course.module';
import { FacultyModule } from './faculty/faculty.module';
import { AgentsApiModule } from './agents-api/agents-api.module';
import { OtpModule } from './otp/otp.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    OtpModule,
    AlumniModule,
    CompanyModule,
    UserModule,
    FileUploadModule,
    CourseModule,
    FacultyModule,
    AgentsApiModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
