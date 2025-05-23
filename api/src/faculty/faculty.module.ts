import { Module } from '@nestjs/common';
import { FacultyController } from './controllers/faculty.controller';
import { FacultyService } from './services/faculty.service';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [FacultyController],
  providers: [FacultyService, PrismaService],
  exports: [FacultyService],
})
export class FacultyModule {}
