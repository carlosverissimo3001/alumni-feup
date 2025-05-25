import { Module } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admin.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { CompanyService } from '@/company/services/company.service';
import { LocationService } from '@/location/location.service';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService, CompanyService, LocationService],
  exports: [AdminService],
})
export class AdminModule {}
