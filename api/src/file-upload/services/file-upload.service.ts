import { UploadExtractionDto } from '@/file-upload/dto/upload-extraction.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ENROLLMENT_HEADERS } from '../consts';
import { readCSV } from '../utils/csv';
import * as fs from 'fs';
import { AlumniService } from '@/alumni/services/alumni.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIN_CONCLUSION_YEAR = 1950;
const MAX_CONCLUSION_YEAR = 2099;
const CREATED_BY = 'file-upload';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alumniService: AlumniService,
  ) {}

  async handleFileUpload(
    dto: UploadExtractionDto,
    file: Express.Multer.File,
  ): Promise<number> {
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
    const createdAlumni = await this.parseFile(file.path, dto);
    fs.unlinkSync(file.path);

    for (const alumniId of createdAlumni) {
      void this.alumniService
        .requestProfileExtraction(alumniId)
        .catch((error) => {
          console.error(
            `Failed to request profile extraction for alumni ${alumniId}:`,
            error,
          );
        });
    }

    return createdAlumni.length;
  }

  async parseFile(
    filePath: string,
    dto: UploadExtractionDto,
  ): Promise<string[]> {
    const { headers, data } = await readCSV(filePath);
    return this.parse_enrollment_upload(headers, data, dto);
  }

  private async parse_enrollment_upload(
    headers: string[],
    data: string[][],
    dto: UploadExtractionDto,
  ): Promise<string[]> {
    const createdAlumni: string[] = [];

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
      const conclusionYearRaw = row[headers.indexOf('conclusion_year')];

      if (!fullName || !conclusionYearRaw) {
        throw new BadRequestException(
          `Invalid enrollment data at row ${rowNumber}: All fields are required`,
        );
      }
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const fullName = row[headers.indexOf('full_name')];
      const conclusionYearRaw = row[headers.indexOf('conclusion_year')];
      const linkedinUrl = row[headers.indexOf('linkedin_url')];

      const yearMatch = conclusionYearRaw.match(/\d{4}/);
      if (!yearMatch) {
        throw new BadRequestException(
          `Invalid conclusion year format at row ${i + 1}: ${conclusionYearRaw}. Expected format: YYYY or YYYY/YYYY or <XYZ> (YYYY/YYYY)`,
        );
      }
      const conclusionYear = parseInt(yearMatch[0]);
      this.validate_conclusion_year(conclusionYear, i + 1);

      const newAlumni = await this.alumniService.create(
        {
          fullName,
          linkedinUrl,
          courses: [
            {
              courseId: dto.courseId,
              conclusionYear,
            },
          ],
          facultyId: dto.facultyId,
          createdBy: CREATED_BY,
        },
        true,
      );
      createdAlumni.push(newAlumni.id);
    }

    return createdAlumni;
  }

  private validate_conclusion_year(conclusionYear: number, rowNumber: number) {
    if (
      isNaN(conclusionYear) ||
      conclusionYear < MIN_CONCLUSION_YEAR ||
      conclusionYear > MAX_CONCLUSION_YEAR
    ) {
      throw new BadRequestException(
        `Invalid conclusion year: ${conclusionYear} at row ${rowNumber}`,
      );
    }
  }
}
