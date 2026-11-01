import { Module } from '@nestjs/common';
import { FacultyController } from './controllers/faculty.controller';
import { FacultyService } from './services/faculty.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FacultyController],
  providers: [FacultyService, PrismaService],
  exports: [FacultyService],
})
export class FacultyModule {}
