import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('V1', 'Admin')
@Controller('admin')
// Only the admin will be able to access these endpoints
// No need to throttle them
@SkipThrottle()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('proxycurl-balance')
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
