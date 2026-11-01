import { UploadExtractionDto } from '@/file-upload/dto/upload-extraction.dto';
import { UploadExtractionResponseDto } from '@/file-upload/dto/upload-extraction-response.dto';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileUploadService } from '../services/file-upload.service';
import { RequirePermission, UserAuthGuard } from '@/auth/user-auth.guard';
import { CurrentUser } from '@/auth/current-user.decorator';
import { Alumni } from '@prisma/client';

@ApiTags('V1')
@Controller('files')
@UseGuards(UserAuthGuard)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @RequirePermission('admin', 'write')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiBody({
    description: 'Data to upload',
    type: UploadExtractionDto,
  })
  @ApiResponse({
    description: 'The created-alumni count and the pipeline run started for them',
    type: UploadExtractionResponseDto,
  })
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadExtractionDto,
    @CurrentUser() user: Alumni,
  ) {
    return this.fileUploadService.handleFileUpload(body, file, user.id);
  }
}
