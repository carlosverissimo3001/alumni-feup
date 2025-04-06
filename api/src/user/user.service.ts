import { Injectable } from '@nestjs/common';
import { LinkedinAuthDto } from './dtos/linkedin-auth.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async linkedinAuth(body: LinkedinAuthDto) {
    // Here, we ill match the user who just logged in with the Alumni data we have in the database
  }
}
