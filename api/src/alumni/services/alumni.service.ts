import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  Alumni,
  GeoJSONFeatureCollection,
  Graduation,
  GeoJSONProperties,
} from 'src/entities/';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAlumniDto, VerifyEmailDto, VerifyEmailTokenDto } from '@/dto';
import { AlumniRepository } from '../repositories/alumni.repository';
import { GetGeoJSONDto } from 'src/dto/getgeojson.dto';
import { Feature, Point } from 'geojson';
import { GROUP_BY } from '@/consts';
import { GeolocationService } from 'src/geolocation/geolocation.service';
import { AgentsApiService } from 'src/agents-api/agents-api.service';
import { parseNameParts, sanitizeLinkedinUrl } from '../utils';
import { OtpService } from '@/otp/otp.service';
import { AlumniExtended } from '@/entities/alumni.entity';

type GraduationWithCourse = Graduation & {
  Course: {
    name: string;
    acronym: string;
  };
};

type AlumniGrouped = {
  coordinates: [number, number];
  compareYearStudents?: number;
  alumni: Array<{
    name: string;
    linkedin_url: string;
    profile_pic: string;
    graduations: Array<{
      course_acronym: string;
      conclusion_year: number | null;
    }>;
    jobTitle: string | null;
    companyName: string | null;
  }>;
};

type AlumniByCountry = {
  [country: string]: AlumniGrouped;
};

type AlumniByCity = {
  [city: string]: AlumniGrouped;
};

@Injectable()
export class AlumniService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geolocationService: GeolocationService,
    private readonly alumniRepository: AlumniRepository,
    private readonly agentsApiService: AgentsApiService,
    private readonly otpService: OtpService,
  ) {}

  async findAll(): Promise<Alumni[]> {
    return this.alumniRepository.findAll();
  }

  async getAlumniToReview(): Promise<AlumniExtended[]> {
    return this.alumniRepository.findAllToReview();
  }

  async markAsReviewed(id: string): Promise<Alumni> {
    return this.alumniRepository.update(id, {
      wasReviewed: true,
    });
  }

  async findAllGeoJSON(
    query: GetGeoJSONDto,
  ): Promise<GeoJSONFeatureCollection> {
    let alumni = await this.alumniRepository.findAllGeoJSON(query);

    //Swap selectedYear and compareYear if selectedYear is greater than compareYear
    if (
      query.compareYear &&
      query.selectedYear &&
      query.compareYear > query.selectedYear
    ) {
      const tempYear = query.selectedYear;
      query.selectedYear = query.compareYear;
      query.compareYear = tempYear;
    }

    let alumniCompareYear: Alumni[] = [];
    if (query.compareYear) {
      alumniCompareYear = this.filterAlumniByStartDate(
        alumni,
        query.compareYear,
      );
    }

    alumni = this.filterAlumniByStartDate(alumni, query.selectedYear);

    const groupBy = query.groupBy;
    let alumniByGroup: AlumniByCountry | AlumniByCity;

    if (groupBy === GROUP_BY.COUNTRIES) {
      if (query.compareYear && query.selectedYear) {
        alumniByGroup = await this.groupAlumniByCountryWithRoleAndCompareYear(
          alumni,
          alumniCompareYear,
        );
      } else if (query.selectedYear) {
        alumniByGroup = await this.groupAlumniByCountryWithRole(alumni);
      } else {
        alumniByGroup = await this.groupAlumniByCountry(alumni);
      }
    } else {
      alumniByGroup = this.groupAlumniByCity(alumni);
    }

    // Convert grouped data to GeoJSON features
    const features: Array<Feature<Point, GeoJSONProperties>> = Object.entries(
      alumniByGroup,
    ).map(([group, data]) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: data.coordinates,
      },
      properties: {
        name: [group],
        students: data.alumni.length || 0,
        compareYearStudents: data.compareYearStudents,
        listLinkedinLinksByUser: data.alumni.reduce(
          (acc, curr) => {
            if (curr.linkedin_url) {
              acc[curr.linkedin_url] = curr.name;
            }
            return acc;
          },
          {} as { [key: string]: string },
        ),
        profilePics: data.alumni.reduce(
          (acc, curr) => {
            if (curr.profile_pic) {
              acc[curr.linkedin_url] = curr.profile_pic;
            }
            return acc;
          },
          {} as { [key: string]: string },
        ),
        jobTitles: data.alumni.reduce(
          (acc, curr) => {
            if (curr.jobTitle) {
              acc[curr.linkedin_url] = curr.jobTitle;
            }
            return acc;
          },
          {} as { [key: string]: string },
        ),
        companyNames: data.alumni.reduce(
          (acc, curr) => {
            if (curr.companyName) {
              acc[curr.linkedin_url] = curr.companyName;
            }
            return acc;
          },
          {} as { [key: string]: string },
        ),
        coursesYearConclusionByUser: data.alumni.reduce(
          (acc, curr) => {
            if (curr.linkedin_url) {
              acc[curr.linkedin_url] = curr.graduations.reduce(
                (courses, grad) => {
                  if (grad.conclusion_year) {
                    const academicYear = grad.conclusion_year.toString();
                    courses[grad.course_acronym] = academicYear;
                  }
                  return courses;
                },
                {} as { [key: string]: string },
              );
            }
            return acc;
          },
          {} as { [key: string]: { [key: string]: string } },
        ),
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  private filterAlumniByStartDate(
    alumni: Alumni[],
    selectedYear?: number,
  ): Alumni[] {
    let filteredAlumni: Alumni[] = [];
    if (selectedYear) {
      alumni.forEach((alumnus) => {
        if (alumnus.Roles) {
          alumnus.Roles.sort(
            (a, b) =>
              new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
          ); //Order By Start Date
          const roleFound = alumnus.Roles.find(
            (role) =>
              role.startDate < new Date(selectedYear, 0, 1) &&
              (role.endDate == null ||
                role.endDate > new Date(selectedYear, 0, 1)),
          );
          if (roleFound && roleFound.Location) {
            const alumniToAdd = JSON.parse(JSON.stringify(alumnus));
            alumniToAdd.Roles = [];
            alumniToAdd.Roles.push(roleFound);
            filteredAlumni.push(alumniToAdd);
          }
        }
      });
    } else {
      alumni.forEach((alumnus) => {
        if (alumnus.Roles) {
          alumnus.Roles.sort(
            (a, b) =>
              new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
          ); //Order By Start Date
        }
      });
      filteredAlumni = alumni;
    }
    return filteredAlumni;
  }

  async findOne(id: string): Promise<Alumni> {
    const alumni = await this.alumniRepository.find({ id });
    if (!alumni) {
      throw new NotFoundException(`Alumni with ID ${id} not found`);
    }
    return alumni;
  }

  async create(body: CreateAlumniDto): Promise<Alumni> {
    const linkedinUrl = sanitizeLinkedinUrl(body.linkedinUrl);

    const alumni = await this.alumniRepository.find({ linkedinUrl });
    if (alumni) {
      throw new HttpException(
        'Oops! Seems like you are already in our system. If this is not the case, double-check your LinkedIn URL',
        HttpStatus.CONFLICT,
      );
    }

    const { firstName, lastName } = parseNameParts(body.fullName);

    const newAlumni = await this.prisma.alumni.create({
      data: {
        firstName,
        lastName,
        fullName: body.fullName,
        linkedinUrl,
        // If the alumni had to manually add their data, they 99.99% don't have a sigarra match
        hasSigarraMatch: false,
        // keep false for now, as we'll probably remove the "group" feature
        isInGroup: false,
        wasReviewed: false,
      },
    });

    for (const graduation of body.courses) {
      await this.prisma.graduation.create({
        data: {
          alumniId: newAlumni.id,
          courseId: graduation.courseId,
          conclusionYear: graduation.conclusionYear,
        },
      });
    }

    // Call the agents-api to extract the profile data
    await this.agentsApiService.triggerLinkedinScrape(newAlumni.id);

    return newAlumni;
  }

  /**
   * Generates a verification code and saves it to Redis
   * @param body - The body of the request
   */
  async verifyEmail(body: VerifyEmailDto): Promise<void> {
    const { email } = body;

    // ! *** NOT READY FOR PROD CODE START ***
    const code = '123456';
    const hashed = this.otpService['hash'](code);
    await this.otpService['redis'].set(`otp:${email}`, hashed, 'EX', 600);
    console.log(`Test code set for ${email}: ${code}`);
    // ! *** NOT READY FOR PROD CODE END ***

    // *** ACTUAL GOOD LOGIC START ***
    // const code = await this.otpService.generateOTP(email);
    // await this.mailService.sendEmail({
    //   to: email,
    //   subject: 'Your Verification Code',
    //   text: `Your verification code is: ${code}`,
    // });
    // *** ACTUAL GOOD LOGIC END ***
  }

  /**
   * Verifies the email token
   * @param body - The body of the request
   */
  async verifyEmailToken(body: VerifyEmailTokenDto): Promise<void> {
    const { email, token } = body;
    const isValid = await this.otpService.verifyOTP(email, token);

    if (!isValid) {
      throw new HttpException(
        'Invalid verification code',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async groupAlumniByCountry(alumni: Alumni[]): Promise<AlumniByCountry> {
    const acc: AlumniByCountry = {};
    // Cache of country coordinates
    const countryCoords: { [key: string]: { lon: number; lat: number } } = {};

    for (const alumnus of alumni) {
      if (
        !alumnus.Location?.country ||
        !alumnus.Location?.latitude ||
        !alumnus.Location?.longitude
      ) {
        continue;
      }

      const country = alumnus.Location.country;
      if (!countryCoords[country]) {
        countryCoords[country] =
          await this.geolocationService.getCountryCoordinatesFromDatabase(
            country,
          );
      }

      const coords = countryCoords[country];

      if (!acc[country]) {
        acc[country] = {
          coordinates: [coords.lon, coords.lat],
          compareYearStudents: undefined,
          alumni: [],
        };
      }

      acc[country].alumni.push({
        name: `${alumnus.firstName} ${alumnus.lastName}`,
        linkedin_url: alumnus.linkedinUrl || '',
        profile_pic: alumnus.profilePictureUrl || '',
        graduations:
          alumnus.Graduations?.map((grad: GraduationWithCourse) => ({
            course_acronym: grad.Course.acronym,
            conclusion_year: grad.conclusionYear || null,
          })) || [],
        jobTitle: alumnus.Roles?.[0]?.JobClassification?.[0]?.title || null,
        companyName: alumnus.Roles?.[0]?.Company?.name || null,
      });
    }

    return acc;
  }

  async groupAlumniByCountryWithRole(
    alumni: Alumni[],
  ): Promise<AlumniByCountry> {
    const acc: AlumniByCountry = {};
    // Cache of country coordinates
    const countryCoords: { [key: string]: { lon: number; lat: number } } = {};

    for (const alumnus of alumni) {
      if (
        !alumnus.Roles![0].Location?.country ||
        !alumnus.Roles![0].Location?.latitude ||
        !alumnus.Roles![0].Location?.longitude
      ) {
        continue;
      }

      const country = alumnus.Roles![0].Location.country;
      if (!countryCoords[country]) {
        countryCoords[country] =
          await this.geolocationService.getCountryCoordinatesFromDatabase(
            country,
          );
      }

      const coords = countryCoords[country];

      if (!acc[country]) {
        acc[country] = {
          coordinates: [coords.lon, coords.lat],
          compareYearStudents: undefined,
          alumni: [],
        };
      }

      acc[country].alumni.push({
        name: `${alumnus.firstName} ${alumnus.lastName}`,
        linkedin_url: alumnus.linkedinUrl || '',
        profile_pic: alumnus.profilePictureUrl || '',
        graduations:
          alumnus.Graduations?.map((grad: GraduationWithCourse) => ({
            course_acronym: grad.Course.acronym,
            conclusion_year: grad.conclusionYear || null,
          })) || [],
        jobTitle: alumnus.Roles?.[0]?.JobClassification?.[0]?.title || null,
        companyName: alumnus.Roles?.[0]?.Company?.name || null,
      });
    }

    return acc;
  }

  async groupAlumniByCountryWithRoleAndCompareYear(
    alumni: Alumni[],
    alumniCompareYear: Alumni[],
  ): Promise<AlumniByCountry> {
    const acc: AlumniByCountry = {};
    // Cache of country coordinates
    const countryCoords: { [key: string]: { lon: number; lat: number } } = {};

    for (const alumnus of alumni) {
      if (
        !alumnus.Roles![0].Location?.country ||
        !alumnus.Roles![0].Location?.latitude ||
        !alumnus.Roles![0].Location?.longitude
      ) {
        continue;
      }

      const country = alumnus.Roles![0].Location.country;
      if (!countryCoords[country]) {
        countryCoords[country] =
          await this.geolocationService.getCountryCoordinatesFromDatabase(
            country,
          );
      }

      const coords = countryCoords[country];
      if (!acc[country]) {
        acc[country] = {
          coordinates: [coords.lon, coords.lat],
          compareYearStudents: 0,
          alumni: [],
        };
      }

      const alumnusCY = alumniCompareYear.find(
        (alumnusCY) => alumnusCY.id == alumnus.id,
      );

      if (alumnusCY) {
        if (
          !alumnusCY.Roles![0].Location ||
          alumnus.Roles![0].Location.country !=
            alumnusCY.Roles![0].Location.country
        ) {
          acc[country].compareYearStudents! += 1;
        } else if (
          alumnus.Roles![0].Location.country ==
          alumnusCY.Roles![0].Location.country
        ) {
          acc[country].compareYearStudents! += 1;
        }
      } else {
        acc[country].compareYearStudents! += 1;
      }

      acc[country].alumni.push({
        name: `${alumnus.firstName} ${alumnus.lastName}`,
        linkedin_url: alumnus.linkedinUrl || '',
        profile_pic: alumnus.profilePictureUrl || '',
        graduations:
          alumnus.Graduations?.map((grad: GraduationWithCourse) => ({
            course_acronym: grad.Course.acronym,
            conclusion_year: grad.conclusionYear || null,
          })) || [],
        jobTitle: alumnus.Roles?.[0]?.JobClassification?.[0]?.title || null,
        companyName: alumnus.Roles?.[0]?.Company?.name || null,
      });
    }

    for (const alumnusCompareYear of alumniCompareYear) {
      if (
        alumnusCompareYear.Roles![0].Location &&
        alumnusCompareYear.Roles![0].Location.country
      ) {
        const country = alumnusCompareYear.Roles![0].Location.country;
        if (!countryCoords[country]) {
          countryCoords[country] =
            await this.geolocationService.getCountryCoordinatesFromDatabase(
              country,
            );
        }

        const coords = countryCoords[country];
        if (!acc[country]) {
          acc[country] = {
            coordinates: [coords.lon, coords.lat],
            compareYearStudents: 0,
            alumni: [],
          };
        }

        acc[country].compareYearStudents! -= 1;
      }
    }

    return acc;
  }

  groupAlumniByCity(alumni: Alumni[]): AlumniByCity {
    return alumni.reduce<AlumniByCity>((acc, alumnus) => {
      if (
        !alumnus.Location?.city ||
        !alumnus.Location?.latitude ||
        !alumnus.Location?.longitude
      ) {
        return acc;
      }

      const city = alumnus.Location.city;

      if (!acc[city]) {
        acc[city] = {
          coordinates: [alumnus.Location.longitude, alumnus.Location.latitude],
          alumni: [],
        };
      }

      acc[city].alumni.push({
        name: `${alumnus.firstName} ${alumnus.lastName}`,
        linkedin_url: alumnus.linkedinUrl || '',
        profile_pic: alumnus.profilePictureUrl || '',
        graduations:
          alumnus.Graduations?.map((grad: GraduationWithCourse) => ({
            course_acronym: grad.Course.acronym,
            conclusion_year: grad.conclusionYear || null,
          })) || [],
        jobTitle: alumnus.Roles?.[0]?.JobClassification?.[0]?.title || null,
        companyName: alumnus.Roles?.[0]?.Company?.name || null,
      });
      return acc;
    }, {});
  }
}
