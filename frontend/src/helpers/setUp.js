// Has functions related with the setup of the project when a new Alumni data is received
class setUp {

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

    // Doesn't delete de alumni table. It adds alumni to it. Only calls the API for the alumnis that are not already in the DB
    // All other tables are updated
    static async addAlumnusData(uploadedFile) {
        try {
            const formData = new FormData();
            formData.append('file', uploadedFile);
            const response = await fetch('http://localhost:8080/admin/addAlumnus', {
                method: 'POST',
                body: formData,
            });

            if (response.ok){
                console.log('Alumnus data added successfully');
                return true;
            } else {
                console.error('Alumnus data added failed');
                return false;
            }
        } catch (error) {
            console.log('Error while adding alumnus data', error);
        }
    }

    // Backup Alumni table to an Excel file which is later downloaded
    static async backupAlumnusExcel() {
        try {
    
            const response = await fetch('http://localhost:8080/admin/readToExcel', {
                method: 'POST',
                body: "",
            });
    
            if (!response.ok) {
                throw new Error('Failed to store the alumni information in the excel.');
            }
    
            const excelBlob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([excelBlob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'alumniInformationAPI.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error: ', error);
        }
    }

    // Backs up the Alumni table (which the data was extracted using the API) to an Excel file
    static async backupAlumniDataExcel() {
        try{
            const response = await fetch('http://localhost:8080/admin/readToExcel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',  // Set the content type to JSON
                },
                body: "",
            });
            if (response.ok){
                console.log('Alumnus data backedup successfully');
                return true;
            } else {
                console.error('Alumnus data backedup failed');
                return false;
            }
        } catch (error) {
            console.log('Error while backing up Alumnus data', error);
        }  
    }

}

export default setUp;