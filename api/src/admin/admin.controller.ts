import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { UserAuthGuard, RequirePermission } from '../auth/user-auth.guard';

@ApiTags('V1', 'Admin')
@Controller('admin')
@SkipThrottle()
@UseGuards(UserAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('proxycurl-balance')
  @RequirePermission('admin', 'read')
  @ApiOperation({ summary: 'Get ProxyCurl balance' })
  @ApiResponse({
    status: 200,
    description: 'ProxyCurl balance',
    type: Number,
  })
  async getProxyCurlBalance() {
    return this.adminService.getProxyCurlBalance();
  }

  @Get('brightdata-balance')
  @RequirePermission('admin', 'read')
  @ApiOperation({ summary: 'Get BrightData balance' })
  @ApiResponse({
    status: 200,
    description: 'BrightData balance',
    type: Number,
  })
  async getBrightDataBalance() {
    return this.adminService.getBrightDataBalance();
  }
}
