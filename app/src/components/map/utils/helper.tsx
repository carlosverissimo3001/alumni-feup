import { Feature, Geometry } from "geojson";
import { GeoJSONProperties } from "../mapFilters";
import { AlumniData } from "@/types/alumni";

export function getYearList(): string[] {
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1994 + 1 },
    (_, i) => currentYear - i
  );
  return years.map((year) => year.toString());
}

/**
 * Converts a Blob to a GeoJSON object
 * @param blob - The Blob to convert
 * @returns The GeoJSON object
 */
export async function convertBlobToGeoJSON(blob: Blob) {
  if (blob) {
    const geoJson = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result as string);
          resolve(json);
        } catch {
          reject("Failed to parse JSON");
        }
      };
      reader.onerror = () => reject("Error reading blob");
      reader.readAsText(blob);
    });
    return geoJson;
  } else {
    return {
      type: "FeatureCollection",
      features: [],
    };
  }
}

/**
 * Extracts JSON objects from a string
 * @param str - The string to extract the JSON objects from
 * @returns The JSON objects
 */
export async function extractJSONObjects(str: string) {
  const jsonObjects = [];
  let depth = 0; // to keep track of nested levels
  let currentObject = "";

  // Iterate over the string to separate JSON objects
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "{") {
      if (depth === 0) {
        currentObject = ""; // start a new object
      }
      depth++; // increment depth for nested objects
    }

    if (depth > 0) {
      currentObject += str[i];
    }

    if (str[i] === "}") {
      depth--; // decrement depth when closing a JSON object
      if (depth === 0) {
        jsonObjects.push(currentObject); // complete object
      }
    }
  }

  return jsonObjects.map((jsonStr) => JSON.parse(jsonStr));
}


/**
 * Parses the place names
 * @param placeNames - The place name to parse
 * @returns The parsed place name
 */
export function parsePlaceNames(placeNames: string | string[]): string[] {
  if (typeof placeNames === "string") {
    const regex = /"([^"]+)"|'([^']+)'/g;
    const matches = placeNames.match(regex);
    return matches ? matches.map((match) => match.replace(/['"]/g, "")) : [];
  }
  return placeNames;
}

/**
 * Extracts the feature fields
 * @param feature - The feature to extract the fields from
 * @returns The extracted fields
 */
export async function extractFeatureFields(
  feature: Feature<Geometry, GeoJSONProperties>
) {
  const listPlaceName = feature.properties.name;
  const students = feature.properties.students;
  const totalAlumni = feature.properties.totalAlumni;
  const totalAlumniPrev = feature.properties.totalAlumniPrev;
  const linkUsersString = feature.properties.listLinkedinLinksByUser;
  const compareYearStudents = feature.properties.compareYearStudents;
  const coursesYearConclusionByUser =
    feature.properties.coursesYearConclusionByUser;
  const profilePics = typeof feature.properties.profilePics === 'string'
    ? (await extractJSONObjects(feature.properties.profilePics))[0]
    : feature.properties.profilePics;
  // Handle linkUsersString directly as it's already an object
  const mapUserLinks =
    typeof linkUsersString === "string"
      ? (await extractJSONObjects(linkUsersString))[0]
      : linkUsersString;
  const listLinkedinLinks = Object.keys(mapUserLinks);
  const listAlumniNames = Object.values(mapUserLinks) as string[];
  const jobTitles = typeof feature.properties.jobTitles === 'string'
    ? (await extractJSONObjects(feature.properties.jobTitles))[0]
    : feature.properties.jobTitles;
  const companyNames = typeof feature.properties.companyNames === 'string'
    ? (await extractJSONObjects(feature.properties.companyNames))[0]
    : feature.properties.companyNames;

  return {
    listPlaceName,
    students,
    totalAlumni,
    totalAlumniPrev,
    compareYearStudents,
    listLinkedinLinks,
    listAlumniNames,
    coursesYearConclusionByUser,
    profilePics,
    jobTitles,
    companyNames
  };
}

interface CourseYear {
  [course: string]: string;
}

interface CourseYearByUser {
  [linkedinUrl: string]: CourseYear;
}

/**
 * Extracts the courses years
 * @param coursesYearConclusionByUser - The courses year conclusion by user
 * @returns The courses years
 */
export async function extractCoursesYears(coursesYearConclusionByUser: string) {
  const mapUserCoursesYears = new Map<string, Map<string, string>>();
  const jsonObjectsPeopleCoursesConclusion = await extractJSONObjects(coursesYearConclusionByUser);
  const mapUserPeopleCoursesConclusion = jsonObjectsPeopleCoursesConclusion.reduce<CourseYearByUser>(
    (acc, obj) => ({ ...acc, ...obj }),
    {}
  );

  Object.entries(mapUserPeopleCoursesConclusion).forEach(([linkedinLink, courseYear]) => {
    const mapCoursesYears = new Map<string, string>();
    Object.entries(courseYear).forEach(([course, year]) => {
      mapCoursesYears.set(course, year);
    });
    mapUserCoursesYears.set(linkedinLink, mapCoursesYears);
  });

  return mapUserCoursesYears;
}

/**
 * Builds the alumni data
 * @param listLinkedinLinks - The list of linkedin links
 * @param listAlumniNames - The list of alumni names
 * @param profilePics - The profile pics
 * @param mapUserCoursesYears - The map of user courses years
 */
export function buildAlumniData(
  listLinkedinLinks: string[],
  listAlumniNames: string[],
  profilePics: { [key: string]: string },
  mapUserCoursesYears: Map<string, Map<string, string>>,
  jobTitles: { [key: string]: string },
  companyNames: { [key: string]: string },
): AlumniData[] {
  return listLinkedinLinks.map((linkedinLink, index) => {
    let coursesCurrentAlumni = "";
    let yearConclusionCurrentAlumni = "";
    const userCoursesYearsConclusion = mapUserCoursesYears.get(linkedinLink);

    userCoursesYearsConclusion?.forEach((yearConclusion, course) => {
      coursesCurrentAlumni += course + " ";
      yearConclusionCurrentAlumni += yearConclusion + " ";
    });

    if (coursesCurrentAlumni === "" || yearConclusionCurrentAlumni === "") {
      coursesCurrentAlumni = "-";
      yearConclusionCurrentAlumni = "-";
    }

    const imageUrl = profilePics[linkedinLink];
    let jobTitle = jobTitles[linkedinLink];
    if(jobTitle == undefined || jobTitle === "") {
      jobTitle = "-";
    }
    let companyName = companyNames[linkedinLink];
    if(companyName == undefined || companyName === "") {
      companyName = "-";
    }

    return {
      name: listAlumniNames[index],
      linkedin_url: listLinkedinLinks[index],
      profile_pic_url: imageUrl,
      courses: coursesCurrentAlumni,
      yearConclusions: yearConclusionCurrentAlumni,
      jobTitle: jobTitle,
      companyName: companyName
    };
  });
}
