import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LinkedinAuthDto, UserAuthResponse } from '@/dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { sanitizeLinkedinUrl } from '@/utils/string';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async linkedinAuth(body: LinkedinAuthDto): Promise<UserAuthResponse> {
    this.logger.log(
      `LinkedIn auth attempt for user: ${body.first_name} ${body.last_name}`,
    );

    // 1. Try to find a match using the LinkedIn URL
    let alumni = null;

    // If we have a LinkedIn URL, try to find a match
    if (body.linkedin_url) {
      const sanitizedLinkedinUrl = sanitizeLinkedinUrl(body.linkedin_url);
      alumni = await this.prisma.alumni.findUnique({
        where: {
          linkedinUrl: sanitizedLinkedinUrl,
        },
      });

      if (alumni) {
        this.logger.log(`Found alumni match by LinkedIn URL: ${alumni.id}`);
      }
    }

    // 2. If no match found by URL, try with person_id
    if (!alumni && body.person_id) {
      alumni = await this.prisma.alumni.findFirst({
        where: {
          personId: body.person_id,
        },
      });

      if (alumni) {
        this.logger.log(`Found alumni match by person_id: ${alumni.id}`);
      }
    }

    // If no match found, throw an unauthorized exception
    if (!alumni) {
      this.logger.warn(
        `No alumni match found for LinkedIn user: ${body.person_id}`,
      );
      throw new UnauthorizedException('No matching alumni record found');
    }

    // 3. Generate a JWT token
    const payload = {
      sub: alumni.id,
      firstName: alumni.firstName,
      lastName: alumni.lastName,
      personId: body.person_id,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION') || '1d',
    });

    // 4. Return the token and user info
    return {
      access_token: token,
      user: {
        id: alumni.id,
        firstName: alumni.firstName,
        lastName: alumni.lastName,
        profilePictureUrl: alumni.profilePictureUrl,
      },
    };
  }
}
