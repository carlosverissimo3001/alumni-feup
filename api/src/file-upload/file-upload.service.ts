import { UploadExtractionDto } from '@/dto/upload-extraction.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ENROLLMENT_HEADERS } from '@/consts/types';
import { readCSV } from './utils';
import * as fs from 'fs';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIN_CONCLUSION_YEAR = 1950;
const MAX_CONCLUSION_YEAR = 2099;

@Injectable()
export class FileUploadService {
  constructor(private readonly prisma: PrismaService) {}

  async handleFileUpload(data: UploadExtractionDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('no file uploaded');
    }
    const allowedMimeTypes = ['text/csv'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type is not allowed: ${file.mimetype}. Only CSV files are allowed.`,
      );
    }

    // We've already checked this in the FE, but doesn't hurt to check again
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File is too large, max size is ${MAX_FILE_SIZE}mb`,
      );
    }

    // Parse and delete file if successful
    await this.parseFile(file.path, data);
    fs.unlinkSync(file.path);

    // Let the data-infra app know that we have a new extraction
    await fetch(`${process.env.DATA_INFRA_APP_URL}/map-extractions`, {
      method: 'POST',
    });
  }

  async parseFile(filePath: string, extractionData: UploadExtractionDto) {
    const { headers, data } = await readCSV(filePath);

    return this.parse_enrollment_upload(headers, data, extractionData);
  }

  private parse_enrollment_upload(
    headers: string[],
    data: string[][],
    extractionData: UploadExtractionDto,
  ) {
    const missingHeaders = ENROLLMENT_HEADERS.filter(
      (header) => !headers.includes(header),
    );

    if (missingHeaders.length > 0) {
      throw new BadRequestException(
        `Missing required columns: ${missingHeaders.join(', ')}.`,
      );
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 1;
      const fullName = row[headers.indexOf('full_name')];
      const conclusionYear = row[headers.indexOf('conclusion_year')];
      const linkedinUrl = row[headers.indexOf('linkedin_url')];

      if (!fullName || !conclusionYear || !linkedinUrl) {
        throw new BadRequestException(
          `Invalid enrollment data at row ${rowNumber}: All fields are required`,
        );
      }
    }

    const enrollmentData = data.map((row, index) => {
      const fullName = row[headers.indexOf('full_name')];
      const conclusionYearRaw = row[headers.indexOf('conclusion_year')];
      const linkedinUrl = row[headers.indexOf('linkedin_url')];

      // Note: Conclusion year can be either just the year, or also something like 2018/2019 for the academic year
      const conclusionYear = parseInt(conclusionYearRaw.split('/')[0]);
      this.validate_conclusion_year(conclusionYear);

      try {
        /* return {
          id: uuidv4(),
          course_id: extractionData.course_id,
          faculty_id: extractionData.faculty_id,
          student_id,
          full_name,
          conclusion_year,
        } as Prisma.CourseExtractionCreateManyInput; */
        // NOTE: Here, we will probably upload this to an intermedia table, before creating the Alumni entity
      } catch (_) {
        throw new BadRequestException(
          `Error processing row ${index + 1}: Graduation status format is invalid. Expected: STATUS(YEAR/YEAR)`,
        );
      }
    });

    /* await this.prisma.courseExtraction.createMany({
      data: enrollmentData,
    }); */

    return { headers, data: enrollmentData };
  }

  private validate_conclusion_year(conclusionYear: number) {
    if (
      isNaN(conclusionYear) ||
      conclusionYear < MIN_CONCLUSION_YEAR ||
      conclusionYear > MAX_CONCLUSION_YEAR
    ) {
      throw new BadRequestException(
        `Invalid conclusion year: ${conclusionYear}`,
      );
    }
  }
}
