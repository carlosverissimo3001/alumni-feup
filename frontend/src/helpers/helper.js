class Helper {
  // Checks if the selected file is an excel file
  static async checkIfExcel(file) {
      const allowedFileTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      if (!allowedFileTypes.includes(file.type)) {
          alert('Invalid file type. Please upload an Excel file.');
          return;
      }
  }
  // Checks if the selected file is a text file
  static async checkIfTextFile(file) {
      const allowedFileTypes = ['text/plain'];
      if (!allowedFileTypes.includes(file.type)) {
          alert('Invalid file type. Please upload a text file.');
          return;
      }
  }

  // Extracts the Json objects
  static async extractJSONObjects(str) {
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

  // Function to flatten nested arrays
  static flattenArray(arr) {
    if (!Array.isArray(arr)) return [arr];
    let flattened = [];
    arr.forEach(item => {
      flattened = flattened.concat(Helper.flattenArray(item));
    });
    return flattened;
  };

  static async parsePlaceNames(placeName) {
    if (typeof placeName === 'string') {
      const regex = /"([^"]+)"|'([^']+)'/g;
      placeName = placeName.match(regex).map(match => match.replace(/['"]/g, ''));
    }
    return Helper.flattenArray(placeName);
  }

  static async extractFeatureFields(feature) {
    var listPlaceName = feature.properties.name;
    const linkUsersString = feature.properties.listLinkedinLinksByUser;
    const coursesYearConclusionByUser = feature.properties.coursesYearConclusionByUser;

    // Separates fields of linkUsersString
    var jsonObjects = await Helper.extractJSONObjects(linkUsersString);
    var mapUserLinks = jsonObjects.reduce((acc, obj) => ({ ...acc, ...obj }), {});
    const listLinkedinLinks = Object.keys(mapUserLinks);
    const listAlumniNames = Object.values(mapUserLinks);

    return { listPlaceName, listLinkedinLinks, listAlumniNames, coursesYearConclusionByUser }
  }

  static async extractCoursesYears(coursesYearConclusionByUser) {
    var mapUserCoursesYears = new Map();
    var jsonObjectsPeopleCoursesConclusion = await Helper.extractJSONObjects(coursesYearConclusionByUser);
    var mapUserPeopleCoursesConclusion = jsonObjectsPeopleCoursesConclusion.reduce((acc, obj) => ({ ...acc, ...obj }), {});
  
    Object.entries(mapUserPeopleCoursesConclusion).forEach(([linkdinLink, courseYear]) => {
      var mapCoursesYears = new Map();
      Object.entries(courseYear).forEach((courseConclusionYears)=>{
        const courseConclusionYearsSplited = courseConclusionYears[1].split("/");
        mapCoursesYears.set(courseConclusionYears[0], courseConclusionYearsSplited[1]);
      });
      mapUserCoursesYears.set(linkdinLink, mapCoursesYears);
    });

    return mapUserCoursesYears;
  }

  static async buildAlumniData(listLinkedinLinks, listAlumniNames, profilePics, mapUserCoursesYears){
    return listLinkedinLinks.map((linkdinLink, index) => {
      var coursesCurrentAlumni = "";
      var yearConclusionCurrentAlumni="";
      var userCoursesYearsConclusion = mapUserCoursesYears.get(linkdinLink);

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
}

export default Helper;
