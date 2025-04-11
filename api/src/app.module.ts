import { Module } from '@nestjs/common';
import { AlumniModule } from './alumni/alumni.module';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { BullModule } from '@nestjs/bull';
import { FileUploadModule } from './file-upload/file-upload.module';
import { ConfigModule } from '@nestjs/config';
import { CourseModule } from './course/course.module';
import { FacultyModule } from './faculty/faculty.module';
import { AgentsApiModule } from './agents-api/agents-api.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AlumniModule,
    CompanyModule,
    UserModule,
    FileUploadModule,
    CourseModule,
    FacultyModule,
    AgentsApiModule,
  ],
})
export class AppModule {}
