import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  Alumni,
  ReviewGeoJSONFeatureCollection,
  ReviewGeoJSONProperties,
} from 'src/entities/';
import { PrismaService } from 'src/prisma/prisma.service';
import { Feature, Point } from 'geojson';
import { GROUP_BY } from '@/consts';
import { GeolocationService } from '@/geolocation/services/geolocation.service';
import { AlumniRepository } from '@/alumni/repositories/alumni.repository';
import { GetReviewGeoJSONDto } from '@/reviews/dto/get-review-geojson.dto';
import { ReviewType } from '@/entities/reviewgeojson.entity';
import { CreateReviewDto } from '@/reviews/dto/create-review.dto';
import { ChangeReviewScoreDto } from '@/reviews/dto/change-review-score.dto';
import { ReviewCompany } from '@/entities/reviewCompany.entity';
import { ReviewLocation } from '@/entities/reviewLocation.entity';
import { ReviewRepository } from '../repositories/review.repository';

type ReviewsGrouped = {
  coordinates: [number, number];
  reviews: Array<{
    reviewId: string;
    linkedinLink: string;
    alumniName: string;
    profile_pic: string;
    description: string;
    rating: number;
    upvotes: string[];
    downvotes: string[];
    reviewType: string;
    companyName: string;
    timeSincePosted: number;
    timeSincePostedType: string;
    createdAt: Date | null;
    anonymous: Boolean;
  }>;
};

type ReviewsByCountry = {
  [country: string]: ReviewsGrouped;
};

type ReviewsByCity = {
  [city: string]: ReviewsGrouped;
};

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geolocationService: GeolocationService,
    private readonly alumniRepository: AlumniRepository,
    private readonly reviewRepository: ReviewRepository,
  ) {}

  async findAllGeoJSON(
    query: GetReviewGeoJSONDto,
  ): Promise<ReviewGeoJSONFeatureCollection> {
    const alumni = await this.alumniRepository.findAllWithReviews(query);

    const groupBy = query.groupBy;
    let reviewsByGroup: ReviewsByCountry | ReviewsByCity;

    if (groupBy === GROUP_BY.COUNTRIES) {
      reviewsByGroup = await this.groupReviewsByCountry(alumni);
    } else {
      reviewsByGroup = this.groupReviewsByCity(alumni);
    }

    const features: Array<Feature<Point, ReviewGeoJSONProperties>> =
      Object.entries(reviewsByGroup).map(([group, data]) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: data.coordinates,
        },
        properties: {
          name: [group],
          reviews: data.reviews.length || 0,
          alumniNames: data.reviews.reduce(
            (acc, curr) => {
              if (curr.alumniName) {
                if (!curr.anonymous) {
                  acc[curr.reviewId] = curr.alumniName;
                } else {
                  acc[curr.reviewId] = 'Anonymous';
                }
              }
              return acc;
            },
            {} as { [key: string]: string },
          ),
          linkedinLinks: data.reviews.reduce(
            (acc, curr) => {
              if (curr.linkedinLink) {
                if (!curr.anonymous) {
                  acc[curr.reviewId] = curr.linkedinLink;
                } else {
                  acc[curr.reviewId] = '';
                }
              }
              return acc;
            },
            {} as { [key: string]: string },
          ),
          profilePics: data.reviews.reduce(
            (acc, curr) => {
              if (curr.profile_pic) {
                if (!curr.anonymous) {
                  acc[curr.reviewId] = curr.profile_pic;
                } else {
                  acc[curr.reviewId] = '';
                }
              }
              return acc;
            },
            {} as { [key: string]: string },
          ),
          descriptions: data.reviews.reduce(
            (acc, curr) => {
              if (curr.description) {
                acc[curr.reviewId] = curr.description;
              }
              return acc;
            },
            {} as { [key: string]: string },
          ),
          ratings: data.reviews.reduce(
            (acc, curr) => {
              if (curr.rating) {
                acc[curr.reviewId] = curr.rating;
              }
              return acc;
            },
            {} as { [key: string]: number },
          ),
          upvotes: data.reviews.reduce(
            (acc, curr) => {
              if (curr.upvotes) {
                acc[curr.reviewId] = curr.upvotes;
              }
              return acc;
            },
            {} as { [key: string]: string[] },
          ),
          downvotes: data.reviews.reduce(
            (acc, curr) => {
              if (curr.downvotes) {
                acc[curr.reviewId] = curr.downvotes;
              }
              return acc;
            },
            {} as { [key: string]: string[] },
          ),
          reviewTypes: data.reviews.reduce(
            (acc, curr) => {
              if (curr.reviewType) {
                acc[curr.reviewId] = curr.reviewType;
              }
              return acc;
            },
            {} as { [key: string]: string },
          ),
          companyNames: data.reviews.reduce(
            (acc, curr) => {
              if (curr.companyName) {
                acc[curr.reviewId] = curr.companyName;
              }
              return acc;
            },
            {} as { [key: string]: string },
          ),
          timeSincePosted: data.reviews.reduce(
            (acc, curr) => {
              if (curr.timeSincePosted) {
                acc[curr.reviewId] = curr.timeSincePosted;
              }
              return acc;
            },
            {} as { [key: string]: number },
          ),
          timeSincePostedType: data.reviews.reduce(
            (acc, curr) => {
              if (curr.timeSincePostedType) {
                acc[curr.reviewId] = curr.timeSincePostedType;
              }
              return acc;
            },
            {} as { [key: string]: string },
          ),
          createdAt: data.reviews.reduce(
            (acc, curr) => {
              if (curr.createdAt) {
                acc[curr.reviewId] = curr.createdAt;
              }
              return acc;
            },
            {} as { [key: string]: Date | null },
          ),
        },
      }));

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  async groupReviewsByCountry(alumni: Alumni[]): Promise<ReviewsByCountry> {
    const acc: ReviewsByCountry = {};

    const countryCoords: { [key: string]: { lon: number; lat: number } } = {};

    for (const alumnus of alumni) {
      if (alumnus.ReviewsLocation) {
        for (const review of alumnus.ReviewsLocation) {
          if (
            !review.Location?.country ||
            !review.Location?.latitude ||
            !review.Location?.longitude
          ) {
            continue;
          }

          const country = review.Location.country;
          if (!countryCoords[country]) {
            countryCoords[country] =
              await this.geolocationService.getCountryCoordinatesFromDatabase(
                country,
              );
          }

          const coords = countryCoords[country];

          if (!acc[country]) {
            acc[country] = {
              coordinates: [coords.lon, coords.lat],
              reviews: [],
            };
          }

          const time = this.getTimeSincePosted(review.createdAt!);

          acc[country].reviews.push({
            reviewId: review.id,
            linkedinLink: alumnus.linkedinUrl || '',
            alumniName: `${alumnus.firstName} ${alumnus.lastName}`,
            profile_pic: alumnus.profilePictureUrl || '',
            description: review.description || '',
            rating: review.rating || 0,
            upvotes: review.upvotes || 0,
            downvotes: review.downvotes || 0,
            reviewType: ReviewType.LOCATION,
            companyName: '',
            timeSincePosted: time.timeSincePosted,
            timeSincePostedType: time.timeSincePostedType,
            createdAt: review.createdAt || null,
            anonymous: review.anonymous,
          });
        }
      }
      if (alumnus.ReviewsCompany) {
        for (const review of alumnus.ReviewsCompany) {
          const location = review.Location;
          if (
            !location ||
            !location.country ||
            !location.latitude ||
            !location.longitude
          ) {
            continue;
          }

          const country = location.country;
          if (!countryCoords[country]) {
            countryCoords[country] =
              await this.geolocationService.getCountryCoordinatesFromDatabase(
                country,
              );
          }

          const coords = countryCoords[country];

          if (!acc[country]) {
            acc[country] = {
              coordinates: [coords.lon, coords.lat],
              reviews: [],
            };
          }

          const time = this.getTimeSincePosted(review.createdAt!);

          acc[country].reviews.push({
            reviewId: review.id,
            linkedinLink: alumnus.linkedinUrl || '',
            alumniName: `${alumnus.firstName} ${alumnus.lastName}`,
            profile_pic: alumnus.profilePictureUrl || '',
            description: review.description || '',
            rating: review.rating || 0,
            upvotes: review.upvotes || 0,
            downvotes: review.downvotes || 0,
            reviewType: ReviewType.COMPANY,
            companyName: review.Company.name || '',
            timeSincePosted: time.timeSincePosted,
            timeSincePostedType: time.timeSincePostedType,
            createdAt: review.createdAt || null,
            anonymous: review.anonymous,
          });
        }
      }
    }

    return acc;
  }

  private getTimeSincePosted(createdAt: Date) {
    const currentDate = new Date();
    const dateDifference = currentDate.getTime() - createdAt.getTime();

    let timeSincePostedType = 'hours';
    let timeSincePosted = Math.floor(dateDifference / (1000 * 3600));
    if (timeSincePosted >= 24) {
      timeSincePostedType = 'days';
      timeSincePosted = Math.floor(dateDifference / (1000 * 3600 * 24));
      if (timeSincePosted > 30) {
        timeSincePostedType = 'months';
        timeSincePosted = Math.floor(timeSincePosted / 30);
        if (timeSincePosted > 11) {
          timeSincePostedType = 'years';
          timeSincePosted = currentDate.getFullYear() - createdAt.getFullYear();
        }
      }
    }

    return { timeSincePosted, timeSincePostedType };
  }

  groupReviewsByCity(alumni: Alumni[]): ReviewsByCity {
    const acc: ReviewsByCity = {};

    for (const alumnus of alumni) {
      for (const review of alumnus.ReviewsCompany!) {
        const location = review.Location;
        if (
          !location ||
          !location.country ||
          !location.latitude ||
          !location.longitude
        ) {
          continue;
        }

        const city = location.city;

        if (!city) {
          continue;
        }

        if (!acc[city]) {
          acc[city] = {
            coordinates: [location.longitude, location.latitude],
            reviews: [],
          };
        }

        const time = this.getTimeSincePosted(review.createdAt!);

        acc[city].reviews.push({
          reviewId: review.id,
          linkedinLink: alumnus.linkedinUrl || '',
          alumniName: `${alumnus.firstName} ${alumnus.lastName}`,
          profile_pic: alumnus.profilePictureUrl || '',
          description: review.description || '',
          rating: review.rating || 0,
          upvotes: review.upvotes || 0,
          downvotes: review.downvotes || 0,
          reviewType: 'Company',
          companyName: review.Company.name || '',
          timeSincePosted: time.timeSincePosted,
          timeSincePostedType: time.timeSincePostedType,
          createdAt: review.createdAt || null,
          anonymous: review.anonymous,
        });
      }
    }

    return acc;
  }

  async create(body: CreateReviewDto): Promise<void> {
    if (body.reviewType === ReviewType.COMPANY.toString()) {
      if (body.companyId === undefined || body.locationId === undefined) {
        throw new HttpException(
          'Missing Company or Location.',
          HttpStatus.CONFLICT,
        );
      }
      await this.prisma.reviewCompany.create({
        data: {
          description: body.description,
          rating: body.rating,
          upvotes: [],
          downvotes: [],
          alumniId: body.alumniId,
          companyId: body.companyId,
          locationId: body.locationId,
          anonymous: body.anonymous,
        },
      });
    } else if (body.reviewType === ReviewType.LOCATION.toString()) {
      if (body.locationId === undefined) {
        throw new HttpException('Missing Location.', HttpStatus.CONFLICT);
      }
      await this.prisma.reviewLocation.create({
        data: {
          description: body.description,
          rating: body.rating,
          upvotes: [],
          downvotes: [],
          alumniId: body.alumniId,
          locationId: body.locationId,
          anonymous: body.anonymous,
        },
      });
    }
    return;
  }

  async changeReviewScoring(
    changeReviewScore: ChangeReviewScoreDto,
  ): Promise<void> {
    let review: ReviewCompany | ReviewLocation | null;
    if (changeReviewScore.alumniId && changeReviewScore.reviewId) {
      review = await this.reviewRepository.findReviewCompany(
        changeReviewScore.reviewId,
      );
      if (!review) {
        review = await this.reviewRepository.findReviewLocation(
          changeReviewScore.reviewId,
        );
        if (!review) {
          throw new NotFoundException('Review not found');
        }
        const [newUpvotes, newDownvotes] = this.buildNewData(
          changeReviewScore,
          review,
        );
        await this.reviewRepository.updateReviewLocation(
          changeReviewScore.reviewId,
          newUpvotes,
          newDownvotes,
        );
      } else {
        const [newUpvotes, newDownvotes] = this.buildNewData(
          changeReviewScore,
          review,
        );
        await this.reviewRepository.updateReviewCompany(
          changeReviewScore.reviewId,
          newUpvotes,
          newDownvotes,
        );
      }
    }
  }

  private buildNewData(
    changeReviewScore: ChangeReviewScoreDto,
    review: ReviewCompany | ReviewLocation,
  ): [string[], string[]] {
    let newUpvotes: string[] = [];
    let newDownvotes: string[] = [];
    if (changeReviewScore.upvote) {
      const exists = review.upvotes.includes(changeReviewScore.alumniId);
      if (exists) {
        newUpvotes.filter((id) => id !== changeReviewScore.alumniId);
      } else {
        newUpvotes = [...review.upvotes, changeReviewScore.alumniId];
      }
      newDownvotes = review.downvotes.filter(
        (id) => id !== changeReviewScore.alumniId,
      );
    } else {
      const exists = review.downvotes.includes(changeReviewScore.alumniId);
      if (exists) {
        newDownvotes.filter((id) => id !== changeReviewScore.alumniId);
      } else {
        newDownvotes = [...review.downvotes, changeReviewScore.alumniId];
      }
      newUpvotes = review.upvotes.filter(
        (id) => id !== changeReviewScore.alumniId,
      );
    }
    return [newUpvotes, newDownvotes];
  }
}
