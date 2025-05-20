import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { GeolocationService } from '../geolocation/geolocation.service';
import { AgentsApiService } from '../agents-api/agents-api.service';
import { OtpService } from '../otp/otp.service';
import { ReviewService } from './services/review.service';
import { ReviewController } from './controllers/review.controller';
import { AlumniRepository } from '@/alumni/repositories/alumni.repository';
import { ReviewRepository } from './repositories/review.repository';
@Module({
  controllers: [ReviewController],
  providers: [
    ReviewService,
    PrismaService,
    AlumniRepository,
    ReviewRepository,
    Logger,
    GeolocationService,
    AgentsApiService,
    OtpService,
  ],
})
export class ReviewModule {}
