import { UploadExtractionDto } from '@/file-upload/dto/upload-extraction.dto';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileUploadService } from '../services/file-upload.service';

@ApiTags('V1', 'Files')
@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Upload a file' })
  @ApiBody({
    description: 'Data to upload',
    type: UploadExtractionDto,
  })
  @ApiResponse({
    description: 'Returns the status of the upload',
    type: String,
  })
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadExtractionDto,
  ) {
    return this.fileUploadService.handleFileUpload(body, file);
  }
}
