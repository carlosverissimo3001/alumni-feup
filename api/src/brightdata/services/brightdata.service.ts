import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Alumni } from '../../entities';
@Injectable()
export class BrightdataService {
  constructor(private prisma: PrismaService) {}

  async scrape(alumni: Alumni) {
    const { linkedinUrl } = alumni;
    // Will call the BrighData trigger collection API
  }
}
