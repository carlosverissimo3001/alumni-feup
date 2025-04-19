import { Prisma } from '@prisma/client';

export const companySelect = {
  id: true,
  name: true,
  logo: true,
} satisfies Prisma.CompanySelect;
