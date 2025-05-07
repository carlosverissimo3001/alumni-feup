import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { UserAuthGuard, RequirePermission } from '../auth/user-auth.guard';
import { MergeCompaniesDto, MergeLocationsDto } from '@/dto';

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

  @Post('merge-companies')
  @RequirePermission('admin', 'write')
  @ApiOperation({ summary: 'Merge companies' })
  @ApiResponse({
    status: 200,
    description: 'Companies merged',
  })
  async mergeCompanies(@Body() mergeCompaniesDto: MergeCompaniesDto) {
    return this.adminService.mergeCompanies(mergeCompaniesDto);
  }

  @Post('merge-locations')
  @RequirePermission('admin', 'write')
  @ApiOperation({ summary: 'Merge locations' })
  @ApiResponse({
    status: 200,
    description: 'Locations merged',
  })
  async mergeLocations(@Body() mergeLocationsDto: MergeLocationsDto) {
    return this.adminService.mergeLocations(mergeLocationsDto);
  }
}
