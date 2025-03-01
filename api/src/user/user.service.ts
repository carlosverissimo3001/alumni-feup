import { Injectable } from '@nestjs/common';
import { LinkedinAuthDto } from './dtos/linkedin-auth.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async linkedinAuth(body: LinkedinAuthDto) {
    // TODO: Match the user who just logged in with the user in the database

    // For now, let's just insert as it is in the db
    const user = await this.prisma.alumni.create({
      data: {
        ...body,
        linkedin_url: 'https://www.linkedin.com/in/test',
      },
    });

    return user;
  }
}
