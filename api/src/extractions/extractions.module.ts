import { Module } from '@nestjs/common';
import { ExtractionsController } from './extractions.controller';
import { ExtractionsService } from './extractions.service';
import { PrismaService } from '../prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: '../../uploads/',
    }),
  ],
  controllers: [ExtractionsController],
  providers: [ExtractionsService, PrismaService],
})
export class ExtractionsModule {}
