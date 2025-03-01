import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { GRADUATION_STATUS } from '@prisma/client';
import { FacultyExtraction } from 'src/entities/faculty_extraction.entity';
import { createReadStream } from 'fs';
import { UploadExtractionDto } from 'src/dto/upload-extraction.dto';

@Injectable()
export class ExtractionsService {
  constructor(private readonly prisma: PrismaService) {}

  // Method to parse CSV file and store data in the database
  async parseCSVAndStore(
    data: UploadExtractionDto,
  ): Promise<any> {
    const { faculty_id, course_id } = data;

    // 1. Read the file
    // 2. Parse the CSV file
    // 3. Store the data in the database
    try {
      // something
    } catch (error) {
      throw new Error('Error parsing CSV file: ' + error);
    }
  }
}