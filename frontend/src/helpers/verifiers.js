class Verfier {
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
}

export default Verfier;
