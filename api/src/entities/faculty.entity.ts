import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Faculty {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'The local name of the faculty',
    example: 'Faculdade de Engenharia da Universidade do Porto',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'The international name of the faculty',
    example: 'Faculty of Engineering of the University of Porto',
  })
  name_int?: string | null;

  @ApiPropertyOptional({
    description: 'The acronym of the faculty',
    example: 'FEUP',
  })
  acronym?: string | null;

  constructor(data: Faculty) {
    this.id = data.id;
    this.name = data.name;
    this.name_int = data.name_int;
    this.acronym = data.acronym;
  }
}
