import { IsNotNullableOptional } from '@/validators/isNotNullableOptional';
import { toBoolean } from '@/validators/toBoolean';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetRoleDto {
  @ApiPropertyOptional({
    description: 'Whether to include the metadata of the role',
    type: Boolean,
    default: false,
  })
  @IsNotNullableOptional()
  @IsBoolean()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  @Transform(({ obj }) => toBoolean(obj.includeMetadata))
  includeMetadata?: boolean = false;
}
