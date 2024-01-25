// Has functions related with the setup of the project when a new Alumni data is received
class setUp {

  /* 
   * Backup of the alumni table to an alumniBack up table. If the table is already populated the data is 
   * going to be deleted and the table repopulated.
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

  /*
   * Calls the endpoint responsible for counting the number of alumni per country
   * calls the API capable of getting the coordinates of each of these countries
   * populates the table view_alumni_country => if the table is already populated, the registers are delted and the table is repopulated.
   * Generates a GeoJSON file.
   */
  static async setUpLocation() {
    try {
        const response = await fetch('http://localhost:8080/setupLocation/populate', {
            method: 'POST',
            body: '',
        });

        if (response.ok){
            console.log('Setup Location successful: tables instantiated, and GeoJSON file created.');
        } else {
            console.error('Setup Location FAILED: tables instantiated, and GeoJSON file created.');
        }
    } catch (error) {
        console.error('Error during ViewAlumniCountry Table upload', error);
    }
  }


  /* Sets the table Alumni by reading from the file which contains the response of the LinkdIn API.
   * This way, if something happens to the DB we avoid having to call the API unecessarly. 
   */
  static async setAlumniUsingBackup(file) {
    try {
        const formData = new FormData();
        formData.append('fileBackup', file);

        const response = await fetch('http://localhost:8080/alumni/uploadBackupFil', {
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

  /* 
   * Calls the endpoint responsible for reading the linkdin links from the file, calling the API capable of scraping the LinkdeIn profile
   * and stores the scraped information in the table Alumni
   */
  static async getAlumniLinkedinInfo(file) {
    return true; // TODO: take this when the code below is to be uncommented
    // File is sent to the server using a 'FormData' object
    /*const formData = new FormData();
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
    }*/
  }
 
}

export default setUp;