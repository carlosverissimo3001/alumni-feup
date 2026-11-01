import { Module } from '@nestjs/common';
import { CourseController } from './controllers/course.controller';
import { CourseService } from './services/course.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CourseController],
  providers: [CourseService, PrismaService],
  exports: [CourseService],
})
export class CourseModule {}
