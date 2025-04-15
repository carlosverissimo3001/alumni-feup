import { PrismaService } from 'src/prisma/prisma.service';


/* 
Service to handle a bunch of data that we want to display in the profile page of an alumni
*/
export class AlumniProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getRoles(alumniId: string) {
    const roles = await this.prisma.role.findMany({
      where: {
        alumniId,
      },
      include: {
        JobClassification: true,
      },
    });

    return roles;
  }
}
