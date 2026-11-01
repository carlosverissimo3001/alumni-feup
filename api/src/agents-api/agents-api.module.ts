import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '@/auth/auth.module';
import { AgentsApiService } from './services/agents-api.service';
import { PipelinesController } from './controllers/pipelines.controller';

@Module({
  imports: [AuthModule],
  controllers: [PipelinesController],
  providers: [AgentsApiService, PrismaService],
  exports: [AgentsApiService],
})
export class AgentsApiModule {}
