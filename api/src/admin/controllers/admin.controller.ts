import { RequirePermission, UserAuthGuard } from '@/auth';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { MergeCompaniesDto, MergeLocationsDto, InviteUserDto } from '../dto';
import { AdminService } from '../services/admin.service';

@ApiTags('V1')
@Controller('admin')
@SkipThrottle()
@UseGuards(UserAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('alumni-extract-balance')
  @RequirePermission('admin', 'read')
  @ApiOperation({
    summary: 'Get the credit balance of the Alumni Extract service',
  })
  @ApiResponse({
    status: 200,
    description: 'Alumni Extract balance',
    type: Number,
  })
  async getAlumniExtractBalance() {
    return this.adminService.getAlumniExtractBalance();
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

  @Post('invite-user')
  @RequirePermission('admin', 'write')
  @ApiOperation({ summary: 'Invite user' })
  @ApiResponse({
    status: 200,
    description: 'User invited',
  })
  async inviteUser(@Body() inviteUserDto: InviteUserDto) {
    return this.adminService.inviteUser(inviteUserDto);
  }
}
