import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExtractionsService } from './extractions.service';
import { UploadExtractionDto } from 'src/dto/upload-extraction.dto';
import { diskStorage } from 'multer';
import { csvFileFilter, csvFileName } from 'src/helpers/file';

@ApiTags('V1', 'Extractions')
@Controller('extractions')
export class ExtractionsController {
  constructor(private readonly extractionsService: ExtractionsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a CSV file for faculty extractions' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: '../../uploads/',
        filename: csvFileName,
      }),
      fileFilter: csvFileFilter,
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadExtractionDto,
  ) {
    const startTime = new Date();

    try {
      await this.extractionsService.parseCSVAndStore(body);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Error uploading file',
      );
    }

    const endTime = new Date();

    const response = {
      message: `File uploaded and parsed in ${endTime.getTime() - startTime.getTime()}ms`,
      data: {
        originalName: file.originalname,
        filename: file.filename,
      },
    };

    return response;
  }
}
