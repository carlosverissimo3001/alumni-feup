import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { UploadExtractionDto } from '@/dto/upload-extraction.dto';

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
