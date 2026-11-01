import { Module } from '@nestjs/common';
import { FileUploadService } from './services/file-upload.service';
import { FileUploadController } from './controllers/file-upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PrismaService } from '@/prisma/prisma.service';
import { AlumniModule } from '@/alumni/alumni.module';
import { AgentsApiModule } from '@/agents-api/agents-api.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
    AlumniModule,
    AgentsApiModule,
    AuthModule,
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService, PrismaService],
})
export class FileUploadModule {}
