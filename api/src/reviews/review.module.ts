import { Module, Logger } from '@nestjs/common';
import { GeolocationService } from '../geolocation/services/geolocation.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewController } from './controllers/review.controller';
import { ReviewRepository } from './repositories/review.repository';
import { ReviewService } from './services/review.service';
import { AlumniModule } from '@/alumni/alumni.module';

@Module({
  imports: [AlumniModule],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    PrismaService,
    ReviewRepository,
    GeolocationService,
    Logger,
  ],
})
export class ReviewModule {}
