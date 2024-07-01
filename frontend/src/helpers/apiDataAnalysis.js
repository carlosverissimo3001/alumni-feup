class ApiDataAnalysis {

    /**
     * Extracts the profile pics of a linkedin user
     */
    static async extractPathToProfilePics(linkedinLinks) {
        const pathsToProfileImage = [];
        linkedinLinks.forEach(link => {
            const parts = link.split('/');
            const profileIdentifier = parts[parts.length-2];
            const pathToProfileImage = `/Images/${profileIdentifier}.png`;
            pathsToProfileImage.push(pathToProfileImage);
        });
        return pathsToProfileImage;
    }

    /**
    * Reads from the alumni table and stores the information in the excel file
    */
    static async almnTblExcel(file) {
        try {
            const formData = new FormData();
            formData.append('excelData', file);

            const response = await fetch('http://localhost:8080/apiDataAnalysis/readToExcel', {
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

    /**
   * Receives an excel to be field with linkedin Links. Makes the match of the students with the alumni information in the DB.
   * Returns an updated excel with the linkedin column field with the found links.
   */
  static async matchLinkedinLinksToStudents(file) {
    try {
        const formData = new FormData();
        formData.append('excelData', file);

        const response = await fetch('http://localhost:8080/apiDataAnalysis/matchLinksToStudents', {
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
}

export default ApiDataAnalysis