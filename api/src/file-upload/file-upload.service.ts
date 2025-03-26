import { UploadExtractionDto } from '@/dto/upload-extraction.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UPLOAD_TYPE, ENROLLMENT_HEADERS } from '@/consts/types';
import { readCSV } from './utils';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

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
    const { upload_type } = extractionData;
    const { headers, data } = await readCSV(filePath);

    if (upload_type === UPLOAD_TYPE.ENROLLMENT) {
      return await this.parse_enrollment_upload(headers, data, extractionData);
    } else if (upload_type === UPLOAD_TYPE.LINKEDIN) {
      return await this.parse_linkedin_upload(headers, data, extractionData);
    } else {
      const errorMessage = `Unknown upload type: ${String(upload_type)}`;
      throw new BadRequestException(errorMessage);
    }
  }

  async parse_enrollment_upload(
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
      const student_id = row[headers.indexOf('student_id')];
      const full_name = row[headers.indexOf('full_name')];
      const status = row[headers.indexOf('status')];

      if (!student_id || !full_name || !status) {
        throw new BadRequestException(
          `Invalid enrollment data at row ${rowNumber}: All fields are required`,
        );
      }
    }

    const enrollmentData = data.map((row, index) => {
      const student_id = row[headers.indexOf('student_id')];
      const full_name = row[headers.indexOf('full_name')];

      // Example: GRADUATED (2019/2020), CONCLUIDO (2019/2020)
      // We jjust care about the conclusion year
      const status_raw = row[headers.indexOf('status')]
        .replace(' ', '')
        .split('(');

      try {
        const conclusion_year = parseInt(status_raw[1].split('/')[1]);

        return {
          id: uuidv4(),
          course_id: extractionData.course_id,
          faculty_id: extractionData.faculty_id,
          student_id,
          full_name,
          conclusion_year,
        } as Prisma.CourseExtractionCreateManyInput;
      } catch (_) {
        throw new BadRequestException(
          `Error processing row ${index + 1}: Graduation status format is invalid. Expected: STATUS(YEAR/YEAR)`,
        );
      }
    });

    await this.prisma.courseExtraction.createMany({
      data: enrollmentData,
    });

    return { headers, data: enrollmentData };
  }

  async parse_linkedin_upload(
    headers: string[],
    data: string[][],
    extractionData: UploadExtractionDto,
  ) {
    // TODO: implement LinkedIn parsing similar to enrollment
    await Promise.resolve(); //  To satisfy linter
    return { headers, data: [] };
  }
}
