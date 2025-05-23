import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  reviewCompanySelect,
  reviewLocationSelect,
} from 'src/prisma/includes/alumni.include';
import { ReviewCompany } from '@/entities/reviewCompany.entity';
import { ReviewLocation } from '@/entities/reviewLocation.entity';

@Injectable()
export class ReviewRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async findReviewCompany(id: string): Promise<ReviewCompany | null> {
    const reviewCompany = await this.prisma.reviewCompany.findFirst({
      where: { id },
      select: reviewCompanySelect,
    });
    return reviewCompany;
  }

  async findReviewLocation(id: string): Promise<ReviewLocation | null> {
    const reviewLocation = await this.prisma.reviewLocation.findFirst({
      where: { id },
      select: reviewLocationSelect,
    });
    return reviewLocation;
  }

  async updateReviewCompany(
    id: string,
    newUpvotes: string[],
    newDownvotes: string[],
  ): Promise<ReviewCompany> {
    return this.prisma.reviewCompany.update({
      where: { id },
      data: {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
      },
      select: reviewCompanySelect,
    });
  }

  async updateReviewLocation(
    id: string,
    newUpvotes: string[],
    newDownvotes: string[],
  ): Promise<ReviewLocation> {
    return this.prisma.reviewLocation.update({
      where: { id },
      data: {
        upvotes: newUpvotes,
        downvotes: newDownvotes,
      },
      select: reviewLocationSelect,
    });
  }
}
