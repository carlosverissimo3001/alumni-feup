import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EscoClassificationDto } from '../dto';
import { EscoService } from '../services/esco.service';

@ApiTags('V1', 'ESCO')
@Controller('esco')
export class EscoController {
  constructor(private readonly escoService: EscoService) {}

  @Get('level-one')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all level 1 ESCO classifications' })
  @ApiResponse({
    status: 200,
    description: 'Returns all level 1 ESCO classifications',
    type: EscoClassificationDto,
    isArray: true,
  })
  getLevelOneClassifications(): Promise<EscoClassificationDto[]> {
    return this.escoService.getLevelOneClassifications();
  }

  @Get('level-two')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all level 2 ESCO classifications' })
  @ApiResponse({
    status: 200,
    description: 'Returns all level 2 ESCO classifications',
    type: EscoClassificationDto,
    isArray: true,
  })
  getLevelTwoClassifications(): Promise<EscoClassificationDto[]> {
    return this.escoService.getLevelTwoClassifications();
  }
}
