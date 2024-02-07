package com.feupAlumni.alumniFEUP.controller;

import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.service.AlumniService;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.io.InputStream;

import java.io.ByteArrayOutputStream;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/alumni")
@CrossOrigin
public class AlumniController {
    @Autowired
    private AlumniService alumniService;

    // Uploads the file containing Alumni LinkedIn links to the Alumni table along side with the data of the LinkedIn profile.
    @PostMapping("/upload")
    public ResponseEntity<String> handleFileUpload(@RequestBody MultipartFile file){
        try {
            alumniService.processFile(file);
            return ResponseEntity.ok("File uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during file upload: " + e.getMessage());
        }        
    }

    // Uploads the BACKUP file containing the result of the LinkedIn API to the Alumni table
    @PostMapping("/uploadBackupFil")
    public ResponseEntity<String> handleFileBackupUpload(@RequestBody MultipartFile fileBackup){
        try {
            alumniService.processFileBackup(fileBackup);
            return ResponseEntity.ok("File Backup uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during file backup upload: " + e.getMessage());
        }        
    }

    // Performs the backup of registers in table "Alumni" to the table AlumniBackup
    @PostMapping("/backup")
    public ResponseEntity<String> handleAlumniBackup(){
        try {
            alumniService.backupAlumnis();
            return ResponseEntity.ok("Alumnis backed up successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during file upload: " + e.getMessage());
        }        
    }

    // Gets data from the Alumni table
    @GetMapping("/getAll")
    public List<Alumni> getAllStudents(){
        return alumniService.getAllAlumnis();
    }

    // Clenas the information needed to match alumnis to linkedin links. One table with the needed data and another table with the ones that are not elegible and why.
    @PostMapping("/dataHundleAlumniMatchLink")
    public ResponseEntity<String> handleDataAlumniMatchLink() {
        try {
            alumniService.dataAlumniMatchLink();
            return ResponseEntity.ok("Data for matching Alumnis with linkedins' links successfully cleaned.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error while cleaning data for matching Alumnis with linkedins' links: " + e.getMessage());
        } 
    }

    // Receives an Excel file and tries to match the students with the alumnis Linkdein links in the DB
    @PostMapping("/matchLinksToAlumnis")
    public ResponseEntity<String> handleMatchLinksToAlumnis(@RequestBody MultipartFile file) {
        try {
            alumniService.matchLinksToAlumnis(file);
            return ResponseEntity.ok("Match between Alumnis and LinkedIn links performed.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during matching between alumnis and linkedin links: " + e.getMessage());
        } 
    }


    @PostMapping("/downloadAlumnLink")
    public ResponseEntity<byte[]> downloadAlumnLink(@RequestParam("excelData") MultipartFile file) throws IOException {
        System.out.println("WLEE");
        // Load the Excel file
        try (InputStream inputStream = file.getInputStream()) {
            Workbook workbook = new XSSFWorkbook(inputStream);

            // Get the first sheet
            Sheet sheet = workbook.getSheetAt(0);

            // Write to cell A2
            Row row = sheet.getRow(1); 
            Cell cell = row.createCell(0);
            cell.setCellValue("New Value");

            // Save the modified workbook to a byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            byte[] modifiedExcelBytes = outputStream.toByteArray();

            // Set the response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("filename", "modified_excel.xlsx");

            return new ResponseEntity<>(modifiedExcelBytes, headers, HttpStatus.OK);
        }
    }

}
