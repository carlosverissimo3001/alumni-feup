package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.handlers.FilesHandler;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.model.AlumniBackup;
import com.feupAlumni.alumniFEUP.model.ViewAlumniWithNoLinkClean;
import com.feupAlumni.alumniFEUP.model.ViewAlumniWithNoLinkDirty;
import com.feupAlumni.alumniFEUP.repository.AlumniBackupRepository;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;
import com.feupAlumni.alumniFEUP.repository.ViewAlumniWithNoLinkDirtyRepository;
import com.feupAlumni.alumniFEUP.repository.ViewAlumniWithNoLinkCleanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Iterator;
import org.apache.poi.ss.usermodel.*;

@Service
public class AlumniServiceImpl implements AlumniService{

    @Autowired
    private AlumniRepository alumniRepository;
    @Autowired
    private AlumniBackupRepository alumniBackupRepository;
    @Autowired
    private ViewAlumniWithNoLinkDirtyRepository viewAlumniWithNoLinkDirtyRepository;
    @Autowired
    private ViewAlumniWithNoLinkCleanRepository viewAlumniWithNoLinkCleanRepository;


    // Cleans the Alumni table if there is information stored
    private void cleanAlumniTable() {
        if (alumniRepository.count() > 0) {   
            try {
                System.out.println("-----");
                System.out.println("Table alumni populated. Registers are going to be deteled!");
                alumniRepository.deleteAll();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void processFile(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()){

            // Read and iterate over the excel file
            Workbook workbook = WorkbookFactory.create(inputStream);
            Sheet sheet = workbook.getSheetAt(1);   // 2nd sheet
            Iterator<Row> rowIterator = sheet.iterator();

            while (rowIterator.hasNext()) {
                try {
                    Row row = rowIterator.next();

                    String linkValue = row.getCell(0).getStringCellValue(); // Column A
                    String existeValue = row.getCell(1).getStringCellValue(); // Column B
    
                    if ("NOVO".equals(existeValue)) {

                        // TODO: COMMENTED THIS CODE SO I DON'T CALL THE API BY ACCIDENT

                        // Call the API that gets the information of a linkedin profile 
                        /*var linkedinInfoResponse = AlumniInfo.getLinkedinProfileInfo(linkValue);

                        if(linkedinInfoResponse.statusCode() == 200){

                            // Stores the result in a file for personal backup
                            String filePath = "C:/Users/jenif/OneDrive/Área de Trabalho/BackUpCallAPI";
                            FilesHandler.storeInfoInFile(linkedinInfoResponse.body(), filePath);
                            
                            // Creates the alumni object with the constructor that needs the linkedinLink and the linkedinInfo
                            Alumni alumni = new Alumni(linkValue, linkedinInfoResponse.body());

                            // Stores the information in the database
                            alumniRepository.save(alumni);
                        } else {
                            System.out.println("API call failed with status code: " + linkedinInfoResponse.statusCode() + linkedinInfoResponse.body() + " For profile: " + linkValue);
                        }*/

                    }
                } catch (Exception error) {
                    System.out.println("error: " + error);
                }
            }
            System.out.println("Alumni table populated with the API scraped information.");
        } catch (Exception e) {
            throw new RuntimeException("Error processing file", e);
        }
    }

    @Override
    public void processFileBackup(MultipartFile fileBackup) {
        
        cleanAlumniTable();

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
        
        System.out.println("Table Alumni repopulated.");
        System.out.println("-----");
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

    @Override
    public void dataAlumniWithoutLink() {

        // Check if AlumniBackup table is not empty
        if (viewAlumniWithNoLinkDirtyRepository.count() > 0) {   
            System.out.println("Table viewAlumniWithNoLinkDirty populated. Registers are going to be deteled!");
            viewAlumniWithNoLinkDirtyRepository.deleteAll();
        }

        // Check if AlumniBackup table is not empty
        if (viewAlumniWithNoLinkCleanRepository.count() > 0) {   
            System.out.println("Table viewAlumniWithNoLinkClean populated. Registers are going to be deteled!");
            viewAlumniWithNoLinkCleanRepository.deleteAll();
        }


        // Accesses the Alumni table and populates the ViewAlumniWithNoLinksClean table and ViewAlumniWithNoLinksDirty table
        List<Alumni> alumniList = alumniRepository.findAll();
        for (Alumni alumni : alumniList) {
            String linkedinInfo = alumni.getLinkedinInfo();
            String fullName = FilesHandler.extractFieldFromJson("full_name", linkedinInfo, "");

            ViewAlumniWithNoLinkDirty viewAlumniWithNoLinkDirty;
            ViewAlumniWithNoLinkClean viewAlumniWithNoLinkClean;
            
            // Goes to the education field of the alumni. Looks for UP or FEUP. Sees the course and field of study.
            // Categorizes the alumni in MIEIC, LEIC/L.EIC, M.EIC, and MEI respectively 
            JsonNode result = FilesHandler.getAlumniEducationDetailsOfFeup(linkedinInfo);
            if (result == null) {
                viewAlumniWithNoLinkDirty = new ViewAlumniWithNoLinkDirty(fullName, "", "", "", "", "", "", "Not a valid education field.");
                viewAlumniWithNoLinkDirtyRepository.save(viewAlumniWithNoLinkDirty);
            } else {
                String school = result.get("schoolName").asText().toLowerCase();
                String course = result.get("degreeName").asText().toLowerCase();
                String fieldOfStudy = result.get("fieldOfStudy").asText().toLowerCase();
                String yearStart = result.get("yearStart").asText().toLowerCase();
                String yearEnd = result.get("yearEnd").asText().toLowerCase();

                if (course.contains("integ") ||  fieldOfStudy.contains("integ")) {  
                    viewAlumniWithNoLinkClean = new ViewAlumniWithNoLinkClean(fullName, school, fieldOfStudy, course, "MIEIC" ,yearStart, yearEnd);
                    viewAlumniWithNoLinkCleanRepository.save(viewAlumniWithNoLinkClean);
                } else if (course.contains("lic") || course.contains("bach") || course.contains("graduate") || course.contains("graduated") || course.contains("undergraduate") ||course.contains("degree") || (course.contains("3") && !course.contains("5"))) {
                    viewAlumniWithNoLinkClean = new ViewAlumniWithNoLinkClean(fullName, school, fieldOfStudy, course, "LEIC/L.EIC" ,yearStart, yearEnd);
                    viewAlumniWithNoLinkCleanRepository.save(viewAlumniWithNoLinkClean);        // lic for variantes of licenciature -- bach for variantes of bacheler TODO: SEE IF IT IS INCLUDING POST GRADUATE OR MASTER DEGREE
                } else if (course.contains("comp") || fieldOfStudy.contains("comp")) {
                    viewAlumniWithNoLinkClean = new ViewAlumniWithNoLinkClean(fullName, school, fieldOfStudy, course, "M.EIC" ,yearStart, yearEnd);
                    viewAlumniWithNoLinkCleanRepository.save(viewAlumniWithNoLinkClean);  
                } else if ((fieldOfStudy.contains("eng") || fieldOfStudy.contains("inf")) && ((course.contains("5") && !course.contains("3")) || course.contains("ms") || course.contains("m.sc") || course.contains("master") || course.contains("mestrado"))) {
                    viewAlumniWithNoLinkClean = new ViewAlumniWithNoLinkClean(fullName, school, fieldOfStudy, course, "MEI" ,yearStart, yearEnd);
                    viewAlumniWithNoLinkCleanRepository.save(viewAlumniWithNoLinkClean);  
                } else {
                    viewAlumniWithNoLinkDirty = new ViewAlumniWithNoLinkDirty(fullName, school, fieldOfStudy, course, "", yearStart, yearEnd, "Invalid fields content. No match with expected.");
                    viewAlumniWithNoLinkDirtyRepository.save(viewAlumniWithNoLinkDirty);
                }
            }     
        }
        System.out.println("Tables ViewAlumniWithNoLinkDirty and ViewAlumniWithNoLinkClean populated.");
    }

}
