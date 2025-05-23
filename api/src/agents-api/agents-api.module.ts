import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgentsApiService } from './services/agents-api.service';

@Module({
  providers: [AgentsApiService, PrismaService],
  exports: [AgentsApiService],
})
export class AgentsApiModule {}
