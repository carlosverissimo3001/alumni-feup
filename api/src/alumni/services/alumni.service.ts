import { Injectable } from '@nestjs/common';
import {
  Alumni,
  GeoJSONFeatureCollection,
  Graduation,
  GeoJSONProperties,
} from 'src/entities/';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAlumniDto } from '../../dto/create-alumni.dto';
import { AlumniRepository } from '../repositories/alumni.repository';
import { GetGeoJSONDto } from 'src/dto/getgeojson.dto';
import { Feature, Point } from 'geojson';

type GraduationWithCourse = Graduation & {
  Course: {
    name: string;
    acronym: string;
  };
};

type AlumniGrouped = {
  coordinates: [number, number];
  alumni: Array<{
    name: string;
    linkedin_url: string;
    profile_pic: string;
    graduations: Array<{
      course_acronym: string;
      conclusion_year: number | null;
    }>;
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
    private readonly alumniRepository: AlumniRepository,
  ) {}

  async findAll(): Promise<Alumni[]> {
    return this.alumniRepository.findAll();
  }

  async findAllGeoJSON(
    query: GetGeoJSONDto,
  ): Promise<GeoJSONFeatureCollection> {
    const alumni = await this.alumniRepository.findAllGeoJSON(query);

    // Group alumni by country
    const alumniByCountry = alumni.reduce<AlumniByCountry>((acc, alumnus) => {
      if (
        !alumnus.Location?.country ||
        !alumnus.Location?.latitude ||
        !alumnus.Location?.longitude
      ) {
        return acc;
      }

      const country = alumnus.Location.country;

      if (!acc[country]) {
        acc[country] = {
          coordinates: [alumnus.Location.longitude, alumnus.Location.latitude],
          alumni: [],
        };
      }

      acc[country].alumni.push({
        name: `${alumnus.first_name} ${alumnus.last_name}`,
        linkedin_url: alumnus.linkedin_url || '',
        profile_pic: alumnus.profile_picture_url || '',
        graduations:
          alumnus.Graduations?.map((grad: GraduationWithCourse) => ({
            course_acronym: grad.Course.acronym,
            conclusion_year: grad.conclusion_year || null,
          })) || [],
      });
      return acc;
    }, {});

    // Convert grouped data to GeoJSON features
    const features: Array<Feature<Point, GeoJSONProperties>> = Object.entries(
      alumniByCountry,
    ).map(([country, data]) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: data.coordinates,
      },
      properties: {
        name: [country],
        students: data.alumni.length,
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

  async findOne(id: string): Promise<Alumni> {
    return this.alumniRepository.findOne(id);
  }

  async create(body: CreateAlumniDto): Promise<Alumni> {
    return this.alumniRepository.create(body);
  }

  groupAlumniByCountry(alumni: Alumni[]): AlumniByCountry {
    return alumni.reduce<AlumniByCountry>((acc, alumnus) => {
      if (
        !alumnus.Location?.country ||
        !alumnus.Location?.latitude ||
        !alumnus.Location?.longitude
      ) {
        return acc;
      }

      const country = alumnus.Location.country;

      if (!acc[country]) {
        acc[country] = {
          coordinates: [alumnus.Location.longitude, alumnus.Location.latitude],
          alumni: [],
        };
      }

      acc[country].alumni.push({
        name: `${alumnus.first_name} ${alumnus.last_name}`,
        linkedin_url: alumnus.linkedin_url || '',
        profile_pic: alumnus.profile_picture_url || '',
        graduations:
          alumnus.Graduations?.map((grad: GraduationWithCourse) => ({
            course_acronym: grad.Course.acronym,
            conclusion_year: grad.conclusion_year || null,
          })) || [],
      });
      return acc;
    }, {});
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
        name: `${alumnus.first_name} ${alumnus.last_name}`,
        linkedin_url: alumnus.linkedin_url || '',
        profile_pic: alumnus.profile_picture_url || '',
        graduations:
          alumnus.Graduations?.map((grad: GraduationWithCourse) => ({
            course_acronym: grad.Course.acronym,
            conclusion_year: grad.conclusion_year || null,
          })) || [],
      });
      return acc;
    }, {});
  }
}
