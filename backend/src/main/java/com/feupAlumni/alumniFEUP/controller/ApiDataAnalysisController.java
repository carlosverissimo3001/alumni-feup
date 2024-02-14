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

}
