import { Logger, Module } from '@nestjs/common';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admin.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { CompanyService } from '@/company/services/company.service';
import { LocationService } from '@/location/location.service';
import { UserModule } from '@/user/user.module';
import { PermissionRepository } from './repositories/permission.repository';

@Module({
  imports: [UserModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    PrismaService,
    CompanyService,
    LocationService,
    PermissionRepository,
    Logger,
  ],
  exports: [AdminService],
})
export class AdminModule {}
