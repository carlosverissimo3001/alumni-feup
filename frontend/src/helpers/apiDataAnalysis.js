class ApiDataAnalysis {

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

}

export default ApiDataAnalysis