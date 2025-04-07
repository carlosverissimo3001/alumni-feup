import { ApiProperty } from '@nestjs/swagger';

export class Faculty {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'The local name of the faculty',
    example: 'Faculdade de Engenharia da Universidade do Porto',
  })
  name: string;

  @ApiProperty({
    description: 'The international name of the faculty',
    example: 'Faculty of Engineering of the University of Porto',
  })
  nameInt?: string | null;

  @ApiProperty({
    description: 'The acronym of the faculty',
    example: 'FEUP',
  })
  acronym: string;

  constructor(data: Faculty) {
    this.id = data.id;
    this.name = data.name;
    this.nameInt = data.nameInt;
    this.acronym = data.acronym;
  }
}
