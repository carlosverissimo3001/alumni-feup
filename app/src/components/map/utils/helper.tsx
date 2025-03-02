import { Feature, Point } from "geojson";
import { GeoJSONProperties } from "../mapFilters";

export function getYearList() : string[] {
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1994 + 1 },
    (_, i) => currentYear - i
  );
  return years.map(year => year.toString());
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
        const json = JSON.parse(reader.result);
        resolve(json);
        } catch (error) {
        reject('Failed to parse JSON');
        }
      };
      reader.onerror = () => reject("Error reading blob");
      reader.readAsText(blob);
    });
    return  geoJson;
  } else {
    return {
      "type": "FeatureCollection",
      "features": []
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
  let currentObject = '';

  // Iterate over the string to separate JSON objects
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{') {
      if (depth === 0) {
        currentObject = ''; // start a new object
      }
      depth++; // increment depth for nested objects
    }

    if (depth > 0) {
      currentObject += str[i];
    }

    if (str[i] === '}') {
      depth--; // decrement depth when closing a JSON object
      if (depth === 0) {
        jsonObjects.push(currentObject); // complete object
      }
    }
  }

  return jsonObjects.map((jsonStr) => JSON.parse(jsonStr));
};

/**
 * Flattens an array
 * @param arr - The array to flatten
 * @returns The flattened array
 */
export function flattenArray(arr: any[]) {
  if (!Array.isArray(arr)) return [arr];
  let flattened = [];
  arr.forEach(item => {
    flattened = flattened.concat(Helper.flattenArray(item));
  });
  return flattened;
};

/**
 * Parses the place names
 * @param placeName - The place name to parse
 * @returns The parsed place name
 */
export async function parsePlaceNames(placeName: string) {
  if (typeof placeName === 'string') {
    const regex = /"([^"]+)"|'([^']+)'/g;
    placeName = placeName.match(regex).map(match => match.replace(/['"]/g, ''));
  }
  return flattenArray(placeName);
}

/**
 * Extracts the feature fields
 * @param feature - The feature to extract the fields from
 * @returns The extracted fields
 */
export async function extractFeatureFields(feature: Feature<Point, GeoJSONProperties>) {
  const listPlaceName = feature.properties.name;
  const linkUsersString = feature.properties.listLinkedinLinksByUser;
  const coursesYearConclusionByUser = feature.properties.coursesYearConclusionByUser;

  // Separates fields of linkUsersString
  const jsonObjects = await extractJSONObjects(linkUsersString);
  const mapUserLinks = jsonObjects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
  const listLinkedinLinks = Object.keys(mapUserLinks);
  const listAlumniNames = Object.values(mapUserLinks);

  return { listPlaceName, listLinkedinLinks, listAlumniNames, coursesYearConclusionByUser }
}

/**
 * Extracts the courses years
 * @param coursesYearConclusionByUser - The courses year conclusion by user
 * @returns The courses years
 */
export async function extractCoursesYears(coursesYearConclusionByUser) {
  const mapUserCoursesYears = new Map();
  const jsonObjectsPeopleCoursesConclusion = await extractJSONObjects(coursesYearConclusionByUser);
  const mapUserPeopleCoursesConclusion = jsonObjectsPeopleCoursesConclusion.reduce((acc, obj) => ({ ...acc, ...obj }), {});

  Object.entries(mapUserPeopleCoursesConclusion).forEach(([linkdinLink, courseYear]) => {
    const mapCoursesYears = new Map();
    Object.entries(courseYear).forEach((courseConclusionYears)=>{
      const courseConclusionYearsSplited = courseConclusionYears[1].split("/");
      mapCoursesYears.set(courseConclusionYears[0], courseConclusionYearsSplited[1]);
    });
    mapUserCoursesYears.set(linkdinLink, mapCoursesYears);
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
export async function buildAlumniData(listLinkedinLinks, listAlumniNames, profilePics, mapUserCoursesYears){
  return listLinkedinLinks.map((linkdinLink, index) => {
    let coursesCurrentAlumni = "";
    let yearConclusionCurrentAlumni="";
    const userCoursesYearsConclusion = mapUserCoursesYears.get(linkdinLink);

    userCoursesYearsConclusion.forEach((yearConclusion, course) => {
      coursesCurrentAlumni+=course+" ";
      yearConclusionCurrentAlumni+=yearConclusion+" ";
    });

    if (coursesCurrentAlumni==="" || yearConclusionCurrentAlumni==="") {
      coursesCurrentAlumni = "-";
      yearConclusionCurrentAlumni = "-";
    } 

    return {
      name: listAlumniNames[index],
      linkedinLink: listLinkedinLinks[index],
      profilePics: profilePics[index],
      courses: coursesCurrentAlumni,
      yearConclusions: yearConclusionCurrentAlumni,
    };
  });
}


// Note(Carlos V.): I don't think this will needed, we'll probably use Cloudinary to 
// store the profile pics and then hotlink them
/* export async function extractPathToProfilePics(linkedinLinks) {
  const pathsToProfileImage = [];
  linkedinLinks.forEach(link => {
    const parts = link.split('/');
    const profileIdentifier = parts[parts.length-2];
    const pathToProfileImage = `/Images/${profileIdentifier}.png`;
    pathsToProfileImage.push(pathToProfileImage);
  });
  return pathsToProfileImage;
}
*/

// Note(Carlos V.): I don't think this will needed   
/*  // Prepares response to the endpoint of populating the DB
static async prepareResponsePopDataBase(response){
  if (response.ok){
    console.log('Success');
    // If any warnings such as a country not recognized by the API were detected then a file with these will be downloaded
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'warningsAlumnusData.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    console.log('Downloaded File!');
    return true;
  } else {
      console.error('Action FAILED.');
      // If the response status is 400 (BAD_REQUEST), it means there is a file to download
      if (response.status === 400) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = 'errorMessages.txt';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          console.log('Downloaded file!');
      }
      return false;
  }
} */