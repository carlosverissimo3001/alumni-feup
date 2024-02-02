package com.feupAlumni.alumniFEUP.service;

//import com.feupAlumni.alumniFEUP.handlers.AlumniInfo;
//import com.feupAlumni.alumniFEUP.handlers.FilesHandler;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.model.AlumniBackup;
import com.feupAlumni.alumniFEUP.repository.AlumniBackupRepository;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
//import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;

//import javax.swing.text.html.HTMLDocument.Iterator;

//import java.io.BufferedReader;

import org.apache.poi.ss.usermodel.*;
//import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.util.Iterator; 

@Service
public class AlumniServiceImpl implements AlumniService{

    @Autowired
    private AlumniRepository alumniRepository;
    @Autowired
    private AlumniBackupRepository alumniBackupRepository;

    @Override
    public void processFile(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()){
            
            // Read and iterate over the excel file
            Workbook workbook = WorkbookFactory.create(inputStream);

            Sheet sheet = workbook.getSheetAt(0);   // 1st sheet
            Iterator<Row> rowIterator = sheet.iterator();

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();

                String linkValue = row.getCell(0).getStringCellValue(); // Column A
                String existeValue = row.getCell(1).getStringCellValue(); // Column B

                System.out.println("linkValue + existeValue: " + linkValue + existeValue);

                if ("NOVO".equals(existeValue)) {
                    System.out.println("-> Link for NOVO: " + linkValue);
                }

            }


            // print value of the columns

            
            /*BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
            String linkedinLink;

            while ((linkedinLink = reader.readLine()) != null){
                if(linkedinLink.length() != 0){
                    // Call the API that gets the information of a linkedin profile
                    var linkedinInfoResponse = AlumniInfo.getLinkedinProfileInfo(linkedinLink);

                    if(linkedinInfoResponse.statusCode() == 200){
                        // Stores the result in a file for personal backup
                        String filePath = "C:/Users/jenif/OneDrive/Área de Trabalho/BackUpCallAPI";
                        FilesHandler.storeInfoInFile(linkedinInfoResponse.body(), filePath);

                        // Creates the alumni object with the constructor that needs the linkedinLink and the linkedinInfo
                        Alumni alumni = new Alumni(linkedinLink, linkedinInfoResponse.body());

                        // Stores the information in the database
                        alumniRepository.save(alumni);
                    }
                    else {
                        System.out.println("API call failed with status code: " + linkedinInfoResponse.statusCode() + linkedinInfoResponse.body() + " For profile: " + linkedinLink);
                    }
                }
            }*/
        } catch (Exception e) {
            throw new RuntimeException("Error processing file", e);
        }
    }

    @Override
    public void processFileBackup(MultipartFile fileBackup) {
        System.out.println(fileBackup);
        try (InputStream inputStream = fileBackup.getInputStream()){
            String fileBackupContent = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);

            String startPattern = "{\"public_identifier\":";
            String endPattern = "]}";

            // first occurance of the start pattern
            int startIndex = fileBackupContent.indexOf(startPattern);

            while (startIndex != -1) {
                // find the next occurrence of the end pattern after the start index
                int endIndex = fileBackupContent.indexOf(endPattern, startIndex + 1);

                if(endIndex != -1){
                    // extract the content between the start and the end patterns
                    String linkedinContent = fileBackupContent.substring(startIndex, endIndex + 2);

                    // Creates the alumni object with the constructor that needs the linkedinInfo
                    Alumni alumni = new Alumni(linkedinContent);

                    // Stores the information in the database
                    alumniRepository.save(alumni);

                    // Find the next occurrence of the start pattern after the end index
                    startIndex = fileBackupContent.indexOf(startPattern, endIndex + 1);
                } else {
                    break;
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error processing file backup", e);
        }
    }

    @Override
    public void backupAlumnis() {
        System.out.println("-----");
        // Check if AlumniBackup table is not empty
        if (alumniBackupRepository.count() > 0) {   
            System.out.println("Table AlumniBackup populated. Registers are going to be deteled!");
            alumniBackupRepository.deleteAll();
        }

        // Fetch all alumnis
        List<Alumni> alumnis = alumniRepository.findAll();

        // Iterate through alumnis and add them to alumnibackup table
        for (Alumni alumni : alumnis) {
            AlumniBackup alumniBackup = new AlumniBackup(alumni.getLinkedinLink(), alumni.getLinkedinInfo());
            alumniBackupRepository.save(alumniBackup);
        }
        System.out.println("Table AlumniBackup repopulated.");
        System.out.println("-----");
    }

    @Override
    public List<Alumni> getAllAlumnis() {
        return alumniRepository.findAll();
    }
}
