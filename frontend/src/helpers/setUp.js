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
    // File is sent to the server using a 'FormData' object
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:8080/alumni/upload', {
            method: 'POST',
            body: '',
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
   * Cleans the needed information to match alumnis to linkdein links. Adds the valid alumnis to one table and the invalid ones to another.
   */
  static async prepareDataAlumniMactchLinks() {
    try {
        const response = await fetch('http://localhost:8080/alumni/dataHundleAlumniMatchLink', {
            method: 'POST',
            body: '',
        });

        if (response.ok){
            console.log('Data for matching Alumnis with linkedins link cleaned.');
        } else {
            console.error('Error while cleaning data for matchhing alumnis with linkedin links.');
        }
    } catch(error) {
        console.error('Error while cleaning data for matchhing alumnis with linkedin links: ', error);
    }
  }

  /**
   * Receives an excel to be field with linkedin Links. Makes the match of the students with the alumni information in the DB.
   * Returns an updated excel with the linkedin column field with the found links.
   */
  static async matchLinksToAlumnis(file) {
    try {
        const formData = new FormData();
        formData.append('excelData', file);

        const response = await fetch('http://localhost:8080/alumni/matchLinksToAlumnis', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to download Excel file.');
        }

        const excelBlob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([excelBlob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'modified_excel.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error: ', error);
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
   * Reads from the Alumni table and writes in an Excel file the alumni name and the professional situation
   */
  static async excelAlmnProfSitu(file) {
    try {
        const formData = new FormData();
        formData.append('excelData', file);

        const response = await fetch('http://localhost:8080/alumni/almProfiSitu', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to get the alumnis and the respective professional situation.');
        }

        const excelBlob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([excelBlob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'alumniProfSitu.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error: ', error);
    }
  }

  /**
   * Reads from the alumni table and stores the information in the excel file
   */
  static async almnTblExcel(file) {
    try {
        const formData = new FormData();
        formData.append('excelData', file);

        const response = await fetch('http://localhost:8080/alumni/almTbExcel', {
            method: 'POST',
            body: formData,
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

}

export default setUp;