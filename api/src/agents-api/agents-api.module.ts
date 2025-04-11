import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgentsApiService } from './agents-api.service';

@Module({
  providers: [AgentsApiService, PrismaService],
  exports: [AgentsApiService],
})
export class AgentsApiModule {} 