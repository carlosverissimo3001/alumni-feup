import { AuthModule } from '@/auth/auth.module';
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PipelinesController } from './controllers/pipelines.controller';
import { AgentsApiService } from './services/agents-api.service';

@Module({
  imports: [AuthModule],
  controllers: [PipelinesController],
  providers: [AgentsApiService, PrismaService],
  exports: [AgentsApiService],
})
export class AgentsApiModule {}
