import { Module } from '@nestjs/common';
import { EscoController } from './controllers/esco.controller';
import { EscoService } from './services/esco.service';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [EscoController],
  providers: [EscoService, PrismaService],
})
export class EscoModule {}
