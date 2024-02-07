package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.handlers.CleanData;
import com.feupAlumni.alumniFEUP.handlers.FilesHandler;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.model.AlumniBackup;
import com.feupAlumni.alumniFEUP.model.ViewAlumniMatchLinkClean;
import com.feupAlumni.alumniFEUP.model.ViewAlumniMatchLinkDirty;
import com.feupAlumni.alumniFEUP.repository.AlumniBackupRepository;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;
import com.feupAlumni.alumniFEUP.repository.ViewAlumniMatchLinkDirtyRepository;
import com.feupAlumni.alumniFEUP.repository.ViewAlumniMatchLinkCleanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.util.Map;

import java.io.InputStream;
import java.io.IOException;

import java.io.ByteArrayOutputStream;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

@Service
public class AlumniServiceImpl implements AlumniService{

    @Autowired
    private AlumniRepository alumniRepository;
    @Autowired
    private AlumniBackupRepository alumniBackupRepository;
    @Autowired
    private ViewAlumniMatchLinkDirtyRepository viewAlumniMatchLinkDirtyRepository;
    @Autowired
    private ViewAlumniMatchLinkCleanRepository viewAlumniMatchLinkCleanRepository;


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

    // Cleans the ViewAlumniMatchLinkClean table and the ViewAlumniMatchLinkDirty table
    private void cleanTablesViewAlumniMatchLinks () {
        if (viewAlumniMatchLinkDirtyRepository.count() > 0) {   
            System.out.println("Table viewAlumniWithNoLinkDirty populated. Registers are going to be deteled!");
            viewAlumniMatchLinkDirtyRepository.deleteAll();
        }
        if (viewAlumniMatchLinkCleanRepository.count() > 0) {   
            System.out.println("Table viewAlumniWithNoLinkClean populated. Registers are going to be deteled!");
            viewAlumniMatchLinkCleanRepository.deleteAll();
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
    public void dataAlumniMatchLink() {

        // Check if tables that store the clean and dirty information are populated, if so they are deleted
        cleanTablesViewAlumniMatchLinks();

        // Accesses the Alumni table and populates the ViewAlumniWithNoLinksClean table and ViewAlumniWithNoLinksDirty table
        List<Alumni> alumniList = alumniRepository.findAll();
        for (Alumni alumni : alumniList) {

            String linkedinInfo = alumni.getLinkedinInfo();

            String fullName = FilesHandler.extractFieldFromJson("full_name", linkedinInfo);
            String publicIdentifier = FilesHandler.extractFieldFromJson("public_identifier", linkedinInfo);;
            String linkedinLink = "linkedin.com/in/" + publicIdentifier + "/";
            
            // In education,looks for UP or FEUP. Categorizes the alumni in MIEIC, LEIC/L.EIC, M.EIC, and MEI respectively 
            JsonNode result = FilesHandler.getAlumniEducationDetailsOfFeup(linkedinInfo);
            if (result == null) {
                ViewAlumniMatchLinkDirty viewAlumniWithNoLinkDirty = new ViewAlumniMatchLinkDirty(linkedinLink, fullName, "", "", "", "", "", "", "Not a valid education field.");
                viewAlumniMatchLinkDirtyRepository.save(viewAlumniWithNoLinkDirty);
            } else {
                String school = result.get("schoolName").asText().toLowerCase();
                String course = result.get("degreeName").asText().toLowerCase();
                String fieldOfStudy = result.get("fieldOfStudy").asText().toLowerCase();
                String yearStart = result.get("yearStart").asText().toLowerCase();
                String yearEnd = result.get("yearEnd").asText().toLowerCase();

                if (CleanData.isValidMIEIC(course, fieldOfStudy)) {  
                    ViewAlumniMatchLinkClean viewAlumniWithNoLinkClean = new ViewAlumniMatchLinkClean(linkedinLink, fullName, school, fieldOfStudy, course, "MIEIC" ,yearStart, yearEnd);
                    viewAlumniMatchLinkCleanRepository.save(viewAlumniWithNoLinkClean);
                } else if (CleanData.isValidLEIC(course)) {
                    ViewAlumniMatchLinkClean viewAlumniWithNoLinkClean = new ViewAlumniMatchLinkClean(linkedinLink, fullName, school, fieldOfStudy, course, "LEIC/L.EIC" ,yearStart, yearEnd);
                    viewAlumniMatchLinkCleanRepository.save(viewAlumniWithNoLinkClean);        
                } else if (CleanData.isValidMEIC(course, fieldOfStudy)) {
                    ViewAlumniMatchLinkClean viewAlumniWithNoLinkClean = new ViewAlumniMatchLinkClean(linkedinLink, fullName, school, fieldOfStudy, course, "M.EIC" ,yearStart, yearEnd);
                    viewAlumniMatchLinkCleanRepository.save(viewAlumniWithNoLinkClean);  
                } else if (CleanData.isValidMEI(course, fieldOfStudy)) {
                    ViewAlumniMatchLinkClean viewAlumniWithNoLinkClean = new ViewAlumniMatchLinkClean(linkedinLink, fullName, school, fieldOfStudy, course, "MEI" ,yearStart, yearEnd);
                    viewAlumniMatchLinkCleanRepository.save(viewAlumniWithNoLinkClean);  
                } else {
                    ViewAlumniMatchLinkDirty viewAlumniWithNoLinkDirty = new ViewAlumniMatchLinkDirty(linkedinLink, fullName, school, fieldOfStudy, course, "", yearStart, yearEnd, "Invalid fields content. No match with expected.");
                    viewAlumniMatchLinkDirtyRepository.save(viewAlumniWithNoLinkDirty);
                }
            }     
        }
        System.out.println("Tables ViewAlumniWithNoLinkDirty and ViewAlumniWithNoLinkClean populated.");
    }

    @Override
    public void matchLinksToAlumnis(MultipartFile file) {

        try (InputStream inputStream = file.getInputStream()){
            // Read and iterate over the excel file
            Workbook workbook = WorkbookFactory.create(inputStream);
            Sheet sheet = workbook.getSheetAt(0);   // 1st sheet
            Iterator<Row> rowIterator = sheet.iterator();

            ArrayList<String> linksMultipleMatched = new ArrayList<>();
            Map<Row, String> rowAndItsLink = new HashMap<>();

            while (rowIterator.hasNext()) {
                try {
                    Row row = rowIterator.next();

                    if (row.getCell(4) != null) { // Verifies if it has a course
                        String courseStudent = row.getCell(4).getStringCellValue().trim(); // Column E

                        // Stores linkedin links that matched with the student
                        ArrayList<String> matchLinks = new ArrayList<>(); 
                        
                        switch (courseStudent) {
                            case "MIEIC":
                                matchLinks = getMatch(courseStudent, row);
                                if (matchLinks.size() != 0) {
                                    System.out.println();
                                    System.out.println("---------- STUDENT: " + row.getCell(1).getStringCellValue().trim() + " -------");
                                    System.out.print("matched links: ");
                                    for (String link : matchLinks) {
                                        System.out.print(link + " / ");
                                    }
                                    System.out.println();
                                }
                                setMatch(matchLinks, linksMultipleMatched, rowAndItsLink, row);
                                break;
                            case "MEI":
                                matchLinks = getMatch(courseStudent, row);
                                if (matchLinks.size() != 0) {
                                    System.out.println();
                                    System.out.println("---------- STUDENT: " + row.getCell(1).getStringCellValue().trim() + " -------");
                                    System.out.print("matched links: ");
                                    for (String link : matchLinks) {
                                        System.out.print(link + " / ");
                                    }
                                    System.out.println();
                                }
                                setMatch(matchLinks, linksMultipleMatched, rowAndItsLink, row);
                                break;
                            case "LEIC":
                                matchLinks = getMatch(courseStudent, row);
                                if (matchLinks.size() != 0) {
                                    System.out.println();
                                    System.out.println("---------- STUDENT: " + row.getCell(1).getStringCellValue().trim() + " -------");
                                    System.out.print("matched links: ");
                                    for (String link : matchLinks) {
                                        System.out.print(link + " / ");
                                    }
                                    System.out.println();
                                }
                                setMatch(matchLinks, linksMultipleMatched, rowAndItsLink, row);
                                break;
                            case "L.EIC":
                                matchLinks = getMatch(courseStudent, row);
                                if (matchLinks.size() != 0) {
                                    System.out.println();
                                    System.out.println("---------- STUDENT: " + row.getCell(1).getStringCellValue().trim() + " -------");
                                    System.out.print("matched links: ");
                                    for (String link : matchLinks) {
                                        System.out.print(link + " / ");
                                    }
                                }
                                setMatch(matchLinks, linksMultipleMatched, rowAndItsLink, row);
                                break;
                            case "M.EIC":
                                matchLinks = getMatch(courseStudent, row);
                                if (matchLinks.size() != 0) {
                                    System.out.println();
                                    System.out.println("---------- STUDENT: " + row.getCell(1).getStringCellValue().trim() + " -------");
                                    System.out.print("matched links: ");
                                    for (String link : matchLinks) {
                                        System.out.print(link + " / ");
                                    }
                                    System.out.println();
                                }
                                setMatch(matchLinks, linksMultipleMatched, rowAndItsLink, row);
                                break;
                            default:
                                break;
                        }                        
                    }
                } catch (Exception error) {
                    System.out.println("error: " + error);
                }
            }
            System.out.println("Match performed nº: " + rowAndItsLink.size());
        } catch (Exception e) {
            throw new RuntimeException("Error while perfoming the match between students and linkedin links: ", e);
        }
    }

    @Override
    public byte[] downloadAlumnLink(MultipartFile file) {
        // Load the Excel file
        try (InputStream inputStream = file.getInputStream()) {
            // Read and iterate over the excel file
            Workbook workbook = new XSSFWorkbook(inputStream);

            Sheet sheet = workbook.getSheetAt(0);   // 1st sheet
            Iterator<Row> rowIterator = sheet.iterator();

            ArrayList<String> linksMultipleMatched = new ArrayList<>();
            Map<Row, String> rowAndItsLink = new HashMap<>();

            while (rowIterator.hasNext()) {
                try {
                    Row row = rowIterator.next();

                    if (row.getCell(4) != null) { // Verifies if it has a course
                        String courseStudent = row.getCell(4).getStringCellValue().trim(); // Column E

                        // Stores linkedin links that matched with the student
                        ArrayList<String> matchLinks = new ArrayList<>(); 
                        
                        switch (courseStudent) {
                            case "MIEIC":
                                matchLinks = getMatch(courseStudent, row);
                                if (matchLinks.size() != 0) {
                                    System.out.println();
                                    System.out.println("---------- STUDENT: " + row.getCell(1).getStringCellValue().trim() + " -------");
                                    System.out.print("matched links: ");
                                    for (String link : matchLinks) {
                                        System.out.print(link + " / ");
                                    }
                                    System.out.println();
                                }
                                setMatch(matchLinks, linksMultipleMatched, rowAndItsLink, row);
                                break;
                            case "MEI":
                                matchLinks = getMatch(courseStudent, row);
                                if (matchLinks.size() != 0) {
                                    System.out.println();
                                    System.out.println("---------- STUDENT: " + row.getCell(1).getStringCellValue().trim() + " -------");
                                    System.out.print("matched links: ");
                                    for (String link : matchLinks) {
                                        System.out.print(link + " / ");
                                    }
                                    System.out.println();
                                }
                                setMatch(matchLinks, linksMultipleMatched, rowAndItsLink, row);
                                break;
                            case "LEIC":
                                matchLinks = getMatch(courseStudent, row);
                                if (matchLinks.size() != 0) {
                                    System.out.println();
                                    System.out.println("---------- STUDENT: " + row.getCell(1).getStringCellValue().trim() + " -------");
                                    System.out.print("matched links: ");
                                    for (String link : matchLinks) {
                                        System.out.print(link + " / ");
                                    }
                                    System.out.println();
                                }
                                setMatch(matchLinks, linksMultipleMatched, rowAndItsLink, row);
                                break;
                            case "L.EIC":
                                matchLinks = getMatch(courseStudent, row);
                                if (matchLinks.size() != 0) {
                                    System.out.println();
                                    System.out.println("---------- STUDENT: " + row.getCell(1).getStringCellValue().trim() + " -------");
                                    System.out.print("matched links: ");
                                    for (String link : matchLinks) {
                                        System.out.print(link + " / ");
                                    }
                                }
                                setMatch(matchLinks, linksMultipleMatched, rowAndItsLink, row);
                                break;
                            case "M.EIC":
                                matchLinks = getMatch(courseStudent, row);
                                if (matchLinks.size() != 0) {
                                    System.out.println();
                                    System.out.println("---------- STUDENT: " + row.getCell(1).getStringCellValue().trim() + " -------");
                                    System.out.print("matched links: ");
                                    for (String link : matchLinks) {
                                        System.out.print(link + " / ");
                                    }
                                    System.out.println();
                                }
                                setMatch(matchLinks, linksMultipleMatched, rowAndItsLink, row);
                                break;
                            default:
                                break;
                        }                        
                    }
                } catch (Exception error) {
                    System.out.println("error: " + error);
                }
            }
            System.out.println("Match performed nº: " + rowAndItsLink.size());

            // Save the modified workbook to a byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            byte[] modifiedExcelBytes = outputStream.toByteArray();
            return modifiedExcelBytes;
        } catch (IOException e) {
            e.printStackTrace();
            return null; 
        }
    }
    
    // Giver a row, wich corresponds to a student, verifies if there is a matching link in linkedin
    private ArrayList<String> getMatch(String courseStudent, Row row) {
        // Stores linkedin links that matched with the student
        ArrayList<String> matchLinks = new ArrayList<>(); 
        
        String[] schoolYearBeginning = row.getCell(9).getStringCellValue().trim().split("/"); //Column J
        String[] schoolYearConclusion = row.getCell(10).getStringCellValue().trim().split("/"); // column k
        
        List<ViewAlumniMatchLinkClean> alumnisOfACourseDB = viewAlumniMatchLinkCleanRepository.findByCourseLetters(courseStudent);
        
        for (ViewAlumniMatchLinkClean mieicAlumni : alumnisOfACourseDB) {
            String yearStart = mieicAlumni.getYearStart();
            String yearEnd = mieicAlumni.getYearEnd();

            if (CleanData.isValidYearBegEnd(yearStart, schoolYearBeginning, yearEnd, schoolYearConclusion)) {
                var namesMatchingCount = alumniHasStudentName(row, mieicAlumni);
                if (namesMatchingCount >= 2) {
                    // POSSIBLE MATCH FOR THIS LINK 
                    matchLinks.add(mieicAlumni.getLinkedin());
                } else {
                    //System.out.println("Even though the allumni: " + mieicAlumni.getFullName() + " matches with the current student in start and end year, it doesn't match with the current student name.");
                }
            } else {
                //System.out.println("This alumni: " + mieicAlumni.getFullName() + " doesn't match with the current student because of the year.");
            }
        }

        return matchLinks;
    };

    // Sees if the match can be set and associates with the student if so
    private void setMatch(ArrayList<String> matchLinks, ArrayList<String> linksMultipleMatched, Map<Row, String> rowAndItsLink, Row row) {
        // If there is only one match to the current student associates the linkedin link to the student
        if (matchLinks.size() == 1) {
            // Verify if the linkedin is inside the list of links that were previously mathced with more than one student
            boolean linkMultipleMatch = verifyLinkMultipleMatch(linksMultipleMatched, matchLinks.get(0));
            if (linkMultipleMatch) {
                //System.out.println("Even thoug the student and the alumni mathced, the link of the linkedin cannot be associated because this linkedin link was previously matched with other students.");
                return;
            }

            // Verifies if the linkedin has already been attributed to another student 
            Row rowFoundWithLink = verifyLinkedinLinkAvailability(rowAndItsLink, matchLinks.get(0));
            if (rowFoundWithLink == null) {
                System.out.println("WILL ADD TO THE EXCEL");           
                
                // Writes the link in the Excel Sheet 
                Cell linkLinkedIn = row.createCell(3); // Column DmatchLinks
                linkLinkedIn.setCellValue(matchLinks.get(0));

                // Adds the row and the linkedin so next iterations are able to see that this link was already associated
                rowAndItsLink.put(row, matchLinks.get(0));
            } else {
                //System.out.println("Even though this student matched with the alumni in temrs of years and name, there is another alumni that matched with this linkedin link");
                linksMultipleMatched.add(matchLinks.get(0)); // add the linkedin to the list of multiple matched
                rowAndItsLink.remove(rowFoundWithLink); // deletes the row associated with that link from the map
                
                // Deltes from that row the link associated
                Cell foundedRowWithSameLink = rowFoundWithLink.createCell(3);
                foundedRowWithSameLink.setCellValue((String) null);
                System.out.println("LINK MATHCED TWICE: " + matchLinks.get(0));
            }
        } else {
            //System.out.println("For this student 0 or more than one possible links were found, so no decision could be made.");
        }
    }


    // Verifies if the alumni name contains any of the names of the student 
    private int alumniHasStudentName(Row row, ViewAlumniMatchLinkClean mieicAlumni) {
        String[] fullNameStudent = row.getCell(1).getStringCellValue().trim().split(" "); // Column B
        String nameAlumni = mieicAlumni.getFullName();
        int namesMatchingCount = 0;
        
        for (String nameStudent : fullNameStudent) {
            if (nameAlumni.contains(nameStudent) && nameStudent.length() > 2) {
                namesMatchingCount++;
            }
        }
        return namesMatchingCount;
    }
    
    // Verify if the linkedin is inside the list of links that were previously mathced with more than one student
    private boolean verifyLinkMultipleMatch(ArrayList<String> linksMultipleMatched, String foundLinkedinLink) {
        for (String link : linksMultipleMatched) {
            if (link.equals(foundLinkedinLink)) {
                return true; // Link has been multiple matched
            }
        }
        return false;
    }

    // Verifies if the linkedin has already been attributed to another student 
    private Row verifyLinkedinLinkAvailability(Map<Row, String> rowAndItsLink, String foundLinkedinLink) {
        for (Map.Entry<Row, String> entry : rowAndItsLink.entrySet()) {
            if (entry.getValue().equals(foundLinkedinLink)) {
                return entry.getKey(); // Return the key associated with the LinkedIn link
            }
        } 
        return null; // Linkedin link is not associated with any key in the map
    }
}
