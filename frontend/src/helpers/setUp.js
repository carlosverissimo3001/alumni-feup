// Has functions related with the setup of the project when a new Alumni data is received
class setUp {

    /* 
    * By calling the API to scrape profile info: populates the Alumni table
    *                                            stores information in a backup file
    *                                            uploades the profile pics to the folder: "C:/alimniProject/backend/src/main/java/com/feupAlumni/alumniFEUP/Images"
    * The name of the profile pics is set to the public identifier of the user, which is retrieved by the API
    */
    static async populateAlumniTable(file) {
        // File is sent to the server using a 'FormData' object
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8080/alumni/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok){
                console.log('File uploaded successfully');
                return true;
            } else {
                console.error('File upload failed');
                return false;
            }

        } catch (error) {
            console.error('Error during file upload:', error);
            return false;
        }
    }

    /* 
    * Backup Alumni Table. If backup table populated => data is deleted and updated with new Alumni table data
    */
    static async setAlumniBackup() {
        try {
            const response = await fetch('http://localhost:8080/alumni/backup', {
                method: 'POST',
                body: '',
            });

            if (response.ok){
                console.log('Alumni backup successful');
            } else {
                console.error('Error during alumni backup.');
            }
        } catch(error) {
            console.error('Error during alumni backup:', error);
        }
    }  

    /* Sets the table Alumni by reading from the file which contains the response of the LinkdIn API.
    * This way, if something happens to the DB we avoid having to call the API unecessarly. 
    */
    static async setAlumniUsingBackup(file) {
        try {
            const formData = new FormData();
            formData.append('fileBackup', file);

            const response = await fetch('http://localhost:8080/alumni/uploadBackupFile', {
                method: 'POST',
                body: formData,
            });

            if (response.ok){
                console.log('Alumni table populated using the backup file.');
            } else {
                console.error('Failed to populate the alumni table using the backup file.');
            }
        } catch (error) {
            console.error('Error during the population of the alumni table using the backup file.', error);
        }
    }

    /**
     * Because once I read from the backup file, some rows in the DB don't have the linkedin link associated. This function 
     * will create the linkedin link to those people
     */
    static async addMissingLinkedinLinks() {
        try {
            const response = await fetch('http://localhost:8080/alumni/missingLinkedinLinks', {
                method: 'POST',
                body: '',
            });

            if (response.ok){
                console.log('Rows with missing linkedin links set.');
            } else {
                console.error('Error while trying to set the linkedin links of the missing rows.');
            }
        } catch(error) {
            console.error('Error while trying to set the linkedin links of the missing rows: ', error);
        }
    }

    /**
     * Make sure that every linkedin link in the alumni table finishes with /
     */
    static async refactorlinkdinLinkAlumnis() {
        try {
            const response = await fetch('http://localhost:8080/alumni/refactorlinkdinLinkAlumnis', {
                method: 'POST',
                body: '',
            });

            if (response.ok){
                console.log('Finished: making sure that every linkedin link in the alumni table finishes with /.');
            } else {
                console.error('Error while trying to make sure that every linkedin link in the alumni table finishes with /.');
            }
        } catch(error) {
            console.error('Error  while trying to make sure that every linkedin link in the alumni table finishes with /: ', error);
        }
    }

    /**
     * Deletes repeated alumnis from the DB
     */
    static async deleteRepeatedAlumnis() {
        try {
            const response = await fetch('http://localhost:8080/alumni/deleteRepeatedAlumnis', {
                method: 'POST',
                body: '',
            });

            if (response.ok){
                console.log('Finished: delte repeated alumnis.');
            } else {
                console.error('Error while trying to delete repeated alumnis.');
            }
        } catch(error) {
            console.error('Error while trying to delete repeated alumnis: ', error);
        }
    }

    /*
    * Responsible for: populate the country table (if already populated - registers are deleted and is repopulated)
    *                  call API to get the coordinates of each country 
    */
    static async populateCountryTable() {
        try {
            const response = await fetch('http://localhost:8080/setupLocation/populateCountry', {
                method: 'POST',
                body: '',
            });

            if (response.ok){
                console.log('Country Table successfully instantiated.');
            } else {
                console.error('Setup Location FAILED.');
            }
        } catch (error) {
            console.error('Error during Country Table upload', error);
        }
    }

    /*
    * Responsible for: populate the city table (if already populated - registers are deleted and is repopulated) 
    *                  calls the API to get the coordinates of each city
    */
    static async populateCityTable() {
        try {
            const response = await fetch('http://localhost:8080/setupLocation/populateCity', {
                method: 'POST',
                body: '',
            });

            if (response.ok){
                console.log('City table successfully instantiated.');
            } else {
                console.error('Setup Location City FAILED.');
            }
        } catch (error) {
            console.error('Error during City Table upload', error);
        }
    }

    /**
    * Responsible for: populating AlumniEIC table (if already populated - registers are deleted and is repopulated)
    */
    static async populateAlumniEICTable(file) {
        // File is sent to the server using a 'FormData' object
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('http://localhost:8080/alumni/populateAlumniEIC', {
                method: 'POST',
                body: formData,
            });

            if (response.ok){
                console.log('AlumniEIC table successfully populated.');
            } else {
                console.error('Population of AlumniEIC failed.');
            }
        } catch (error) {
            console.log('Error while populating AlumniEIC table', error);
        }
    }

    /**
     * Responsible for: populating Courses table (if already populated - registers are deleted and is repopulated)
     * It receives an excel that has on column J courses abreviations 
     */
    static async handlePopulateCoursesTable(file) {
        // File is sent to the server using a 'FormData' object
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('http://localhost:8080/alumni/populateCoursesTable', {
                method: 'POST',
                body: formData,
            });

            if (response.ok){
                console.log('File uploaded successfully');
                return true;
            } else {
                console.error('File upload failed');
                return false;
            }
        } catch (error) {
            console.error('Error during file upload:', error);
            return false;
        }
    }

    /**
    * Generates the country geoJason
    */
   static async generateCountryGeoJason(courseFilter) {
        try{
            const data = JSON.stringify({ courseFilter });
            const response = await fetch('http://localhost:8080/setupLocation/generateCountryGeoJason', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',  // Set the content type to JSON
                },
                body: data,
            });

            if (response.ok){
                console.log('Country geoJason successfully created.');
            } else {
                console.error('Country geoJason creation failed.');
            }
        } catch (error) {
            console.log('Error while generating the country geoJason', error);
        }
   }

   /**
    * Generates the city geoJason
    */
   static async generateCityGeoJason(courseFilter) {
        try{
            const data = JSON.stringify({ courseFilter });
            const response = await fetch('http://localhost:8080/setupLocation/generateCityGeoJason', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',  // Set the content type to JSON
                },
                body: data,
            });

            if (response.ok){
                console.log('City geoJason successfully created.');
            } else {
                console.error('City geoJason creation failed.');
            }
        } catch (error) {
            console.log('Error while generating the city geoJason', error);
        }
   }
}

export default setUp;