import { Module } from '@nestjs/common';
import { AlumniService } from './services/alumni.service';
import { AlumniController } from './controllers/alumni.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AlumniController],
  providers: [AlumniService, PrismaService],
})
export class AlumniModule {}
