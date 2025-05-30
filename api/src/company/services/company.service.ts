import { Injectable, NotFoundException } from '@nestjs/common';
import { Company } from 'src/entities';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Company[]> {
    return this.prisma.company.findMany();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.company.delete({ where: { id } });
  }

  async moveRoles(companyId: string, newCompanyId: string): Promise<void> {
    await this.prisma.role.updateMany({
      where: { companyId },
      data: { companyId: newCompanyId },
    });
  }
}
