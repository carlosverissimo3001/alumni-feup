import { Module } from '@nestjs/common';
import { EscoController } from './esco.controller';
import { EscoService } from './esco.service';
import { PrismaService } from '@/prisma/prisma.service';
@Module({
  controllers: [EscoController],
  providers: [EscoService, PrismaService],
})
export class EscoModule {}
