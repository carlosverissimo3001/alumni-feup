package com.feupAlumni.alumniFEUP.handlers;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;

public class TxtFilesHandler {
    
    // Select the fileName
    public static String selectFileName(File feedbackFile) {
        String fileName = feedbackFile.getName();
        if (feedbackFile.getName().startsWith("warnings")) {
            fileName = "warningsAlumnusData";
        } else if (feedbackFile.getName().startsWith("errors")) {
            fileName = "errorsAlumnusData";
        }
        return fileName;
    }

    // Returns a report file of invalid Excel features
    public static File writeErrorFile(List<String> arrayWithExcelStructureError) throws IOException {
        File feedbackFile = new File("");
        if (!(arrayWithExcelStructureError.size()==0)) {
            feedbackFile = File.createTempFile("errorsAlumnusData", ".txt");
            try (BufferedWriter writer = new BufferedWriter(new FileWriter(feedbackFile))) {
                writer.write("------ Excel Structure Errors ------");
                writer.newLine();
                for (String errorMessage : arrayWithExcelStructureError) {
                    writer.write(errorMessage);
                    writer.newLine();
                }
            }
        }
        return feedbackFile;
    }

    // Returns a report file with errors when calling the Proxycurl API
    public static File writeWarningFile(List<String> arrayWithPopulationErrors) throws IOException {
        File feedbackFile = new File("");
        if (!(arrayWithPopulationErrors.size()==0)) {
            feedbackFile = File.createTempFile("warningsAlumnusData", ".txt");
            try (BufferedWriter writer = new BufferedWriter(new FileWriter(feedbackFile))) {
                writer.write("------ Calls to ProxyCurl API Errors ------");
                writer.newLine();
                for (String errorMessage : arrayWithPopulationErrors) {
                    writer.write(errorMessage);
                    writer.newLine();
                }
            }
        }
        return feedbackFile;
    }

    // Prepares the .txt file download
    public static ResponseEntity<Resource> preparesTxtDownload(List<String> arrayWithPopulationErrors, List<String> arrayWithExcelStructureError) throws IOException {
        if (arrayWithExcelStructureError.size()==0) {
            File feedbackFile = TxtFilesHandler.writeWarningFile(arrayWithPopulationErrors);
            if (feedbackFile.length() == 0) {
                return ResponseEntity.ok().body(null);
            }

            // Set the correct file name
            String feedbackFileName = TxtFilesHandler.selectFileName(feedbackFile);
            
            // Return the file with warnings for download
            InputStreamResource resource = new InputStreamResource(new FileInputStream(feedbackFile));
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + feedbackFileName);
            return ResponseEntity.status(HttpStatus.OK)
                                .headers(headers)
                                .contentLength(feedbackFile.length())
                                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                                .body(resource);        
        } else {
            File feedbackFile = TxtFilesHandler.writeErrorFile(arrayWithExcelStructureError);

            // Set the correct file name
            String feedbackFileName = TxtFilesHandler.selectFileName(feedbackFile);

            // Return the file with errors for download
            InputStreamResource resource = new InputStreamResource(new FileInputStream(feedbackFile));
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + feedbackFileName);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .headers(headers)
                                .contentLength(feedbackFile.length())
                                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                                .body(resource);   
        }  
    }
}
