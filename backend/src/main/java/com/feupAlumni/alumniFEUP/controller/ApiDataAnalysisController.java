package com.feupAlumni.alumniFEUP.controller;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.service.ApiDataAnalysisService;



@RestController
@RequestMapping("/apiDataAnalysis")
@CrossOrigin
public class ApiDataAnalysisController {
    
    @Autowired
    private ApiDataAnalysisService apiDataAnalysisService;

    // Sets the information of the alumni table in a received Excel file, proceeding with the download of the result
    @PostMapping("/readToExcel")
    public ResponseEntity<byte[]> handleAlmTblExcel(@RequestParam("excelData") MultipartFile file) throws IOException {
        try {
            byte[] modifiedExcelBytes = apiDataAnalysisService.alumniTableToExcel(file);
            // Set the response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("filename", "alumniInformationAPI.xlsx");

            return new ResponseEntity<>(modifiedExcelBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } 
    }

    // Returns the Excel file with one column containing the alumni names, and other column containing their professional situation
    @PostMapping("/excelAlmProfiSitu")
    public ResponseEntity<byte[]> handleAlmProfiSitu(@RequestParam("excelData") MultipartFile file) throws IOException {
        try {
            byte[] modifiedExcelBytes = apiDataAnalysisService.excelAlumnProfSitu(file);
            // Set the response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("filename", "alumniProfSitu.xlsx");

            return new ResponseEntity<>(modifiedExcelBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } 
    }

    // Receives an Excel file and tries to match the students with the alumnis Linkdein links in the DB.
    // Returns the file updated, this is, the file with the linkedin column field with the found links
    @PostMapping("/matchLinksToStudents")
    public ResponseEntity<byte[]> handleMatchLinksToStudents(@RequestParam("excelData") MultipartFile file) throws IOException {
        try {
            byte[] modifiedExcelBytes = apiDataAnalysisService.matchLinksToStudents(file);
            // Set the response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("filename", "modified_excel.xlsx");

            return new ResponseEntity<>(modifiedExcelBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } 
    }

}
