import { ApiProperty } from '@nestjs/swagger';

export class UploadExtractionResponseDto {
  @ApiProperty({ description: 'Number of alumni created from the CSV' })
  count: number;

  @ApiProperty({ description: 'Pipeline run started for the newly created alumni' })
  runId: string;
}
