// Has functions related with the setup of the project when a new Alumni data is received
class setUp {

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
    * Fetches the geoJson
    */
    static async fetchGeoJson(courseFilter, yearsConclusionFilter, geoJsonType) {
        try {
            const params = new URLSearchParams({
                courseFilter: courseFilter,
                yearsConclusionFilter: JSON.stringify(yearsConclusionFilter),
                geoJsonType: geoJsonType,
            });

            const response = await fetch(`http://localhost:8080/setupLocation/getGeoJson?${params.toString()}`);
            if (response.ok) {
                const blob = await response.blob();
                console.log('GeoJson blob successfully fetched.');
                return blob;
            } else {
                console.error('GeoJson fetching failed.');
            }
        } catch (e) {
            console.log('Error while fetching the geoJson', e);
        }
    }
    
    // Verifies if the password is correct
    static async verifyCorrectPassword(password){
        try{
            const data = JSON.stringify({ password });
            const response = await fetch('http://localhost:8080/admin/verifyPass', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',  // Set the content type to JSON
                },
                body: data,
            });
            if (response.ok){
                const data = await response.json();
                console.log("data.validPassword: ", data.validPassword);
                return data.validPassword;
            } else {
                console.error('Password unsuccessfully verified.');
            }
        } catch (error) {
            console.log('Error while verifying password', error);
        }  
    }

    // Deletes the alumni information in the DB and repopulates the tables with new information from the LinkdinLink API
    static async replaceAlumnus(uploadedFile) {
        try {
            const formData = new FormData();
            formData.append('file', uploadedFile);
            const response = await fetch('http://localhost:8080/admin/replaceAlumnus', {
                method: 'POST',
                body: formData,
            });

            if (response.ok){
                console.log('Alumnus data replaced successfully');
                return true;
            } else {
                console.error('Alumnus data replacement failed');
                return false;
            }
        } catch (error) {
            console.log('Error while replacing alumnus data', error);
        }
    }

}

export default setUp;