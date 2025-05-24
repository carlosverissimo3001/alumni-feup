import { Controller, Get } from '@nestjs/common';
import { CompanyService } from '../services/company.service';
import { Company } from 'src/entities';
import { Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('V1')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'All companies' })
  findAll(): Promise<Company[]> {
    return this.companyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by id' })
  @ApiResponse({ status: 200, description: 'Company by id' })
  findOne(@Param('id') id: string): Promise<Company> {
    return this.companyService.findOne(id);
  }
}
