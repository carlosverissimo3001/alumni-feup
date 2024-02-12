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
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
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
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.util.Map;
import com.google.gson.JsonParser;

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

    int contagem = 0; 

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
    public void missingLinkedinLinks() {
        List<Alumni> alumniList = alumniRepository.findAll();
        System.out.println("alumniList.size(): " + alumniList.size());
        for (Alumni alumni : alumniList) {
            String linkedinLink = alumni.getLinkedinLink();
            if (linkedinLink == null) {
                String linkedinInfo = alumni.getLinkedinInfo();
                String publicIdentifier = FilesHandler.extractFieldFromJson("public_identifier", linkedinInfo);
                String linkedinLinkNew = "https://www.linkedin.com/in/" + publicIdentifier + "/";

                alumni.setLinkedinLink(linkedinLinkNew);
                alumniRepository.save(alumni);
            }
        }
    }

    @Override
    public byte[] excelAlumnProfSitu(MultipartFile file) {
        // Load the Excel file
        try (InputStream inputStream = file.getInputStream()) {

            // Read and iterate over the excel file
            Workbook workbook = new XSSFWorkbook(inputStream);

            Sheet sheet = workbook.getSheetAt(0);   // 1st sheet

            Iterator<Alumni> alumniIterator = alumniRepository.findAll().iterator();
            
            // Iterate over each row of the excel
            int rowIndex=0;
            Map<String, Integer> occupationCount = new HashMap<>();
            while (alumniIterator.hasNext()) {
                Alumni alumni = alumniIterator.next();
                String linkedinInfo = alumni.getLinkedinInfo();
                String fullName = FilesHandler.extractFieldFromJson("full_name", linkedinInfo);
                String occupation = FilesHandler.extractFieldFromJson("occupation", linkedinInfo);

                int atIndex = occupation.indexOf(" at ");
                if (atIndex != -1) {
                    occupation = occupation.substring(0, atIndex);
                }
                
                // Create a new row and write full name to column 1
                Row row = sheet.getRow(rowIndex);
                if (row == null) {
                    row = sheet.createRow(rowIndex);
                }
                Cell cellFullName = row.createCell(0);
                cellFullName.setCellValue(fullName);

                Cell cellOccupation = row.createCell(1);
                cellOccupation.setCellValue(occupation);
            
                occupationCount.put(occupation, occupationCount.getOrDefault(occupation, 0) + 1);

                rowIndex++;
            }

            // Write occupationCount map to columns E and F
            int columnIndex = 4; // Column E
            rowIndex=0;
            for (Map.Entry<String, Integer> entry : occupationCount.entrySet()) {
                Row row = sheet.getRow(rowIndex);
                if (row == null) {
                    row = sheet.createRow(rowIndex);
                }
                Cell cellOccupation = row.createCell(columnIndex);
                cellOccupation.setCellValue(entry.getKey());
                Cell cellCount = row.createCell(columnIndex + 1);
                cellCount.setCellValue(entry.getValue());
                rowIndex++;
            }
            
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

    @Override
    public byte[] alumniTableToExcel(MultipartFile file) {

        // Load the Excel file
        try (InputStream inputStream = file.getInputStream()) {
            // Read and iterate over the excel file
            Workbook workbook = new XSSFWorkbook(inputStream);

            Sheet sheet = workbook.getSheetAt(0);   // 1st sheet

            String[] mainTitles = {"Linkedin Link", "public_identifier", "profile_pic_url", "background_cover_image_url", "first_name", "last_name", "full_name", "follower_count", "occupation", "headline", "summary", "country", "country_full_name", "city", "state", "experiences"};
            String[] experienceTitles = {"time", "company", "company_linkedin_profile_url", "title", "description", "location", "logo_url"};
            String[] educationMainTitle = {"education"};
            String[] educationTitles = {"time", "field_of_study", "degree_name", "school", "school_linkedin_profile_url", "description", "logo_url", "grade", "activities_and_societies"};
            String[] languageTitle = {"languages"};
            String[] accompOrganisationsMainTitle = {"accomplishment_organisations"};
            String[] accompOrganisationsTitles = {"time", "org_name", "title", "description"};
            String[] accompPublicationsMainTitle = {"accomplishment_publications"};
            String[] accompPublicationsTitles = {"name", "publisher", "published_on", "description", "url"};
            String[] accompHonorsAwardsMainTitle = {"accomplishment_honors_awards"};
            String[] accompHonorsAwardsTitles = {"title", "issuer", "issued_on", "description"};
            String[] accompPatentsMainTitle = {"accomplishment_patents"};
            String[] accompPatentsTitles = {"title", "issuer", "issued_on", "description", "application_number", "patent_number", "url"};
            String[] accompCoursesMainTitle = {"accomplishment_courses"};
            String[] accompCoursesTitles = {"name", "number"};
            String[] accompProjectsMainTitle = {"accomplishment_projects"};
            String[] accompProjectsTitles = {"time", "title", "description", "url"};
            String[] accompTestScoresMainTitle = {"accomplishment_test_scores"};
            String[] accompTestScoresTitles = {"name", "score", "date_on", "description"};
            String[] volunteerWorkMainTitle = {"volunteer_work"};
            String[] volunteerWorkTitles = {"time", "title", "cause", "company", "company_linkedin_profile_url", "description", "logo_url"};
            String[] certificationsMainTitle = {"certifications"};
            String[] certificationsTitles = {"time", "name", "license_number", "display_source", "authority", "url"};
            String[] connectionsMainTitle = {"connections"};
            String[] peopleAlsoViewedMainTitle = {"people_also_viewed"};
            String[] peopleAlsoViewedTitles = {"link", "name", "summary", "location"};
            String[] recommendationsMainTitle = {"recommendations"};
            String[] activitiesMainTitle = {"activities"};
            String[] activitiesTitles = {"title", "link", "activity_status"};
            String[] similarlyNamedProfilesMainTitle = {"similarly_named_profiles"};
            String[] similarlyNamedProfilesTitles = {"name", "link", "summary", "location"};
            String[] articlesMainTitle = {"articles"};
            String[] articlesTitles = {"title", "link", "published_date", "author", "image_url"};
            String[] groupsMainTitle = {"groups"};
            String[] groupsTitles = {"profile_pic_url", "name", "url"};
            String[] lastFields = {"skills", "inferred_salary", "gender", "birth_date", "industry", "extra", "interests", "personal_emails", "personal_numbers"};

            createHeaders(sheet, mainTitles, experienceTitles, educationMainTitle, educationTitles, languageTitle, accompOrganisationsMainTitle, accompOrganisationsTitles, accompPublicationsMainTitle, accompPublicationsTitles, accompHonorsAwardsMainTitle, accompHonorsAwardsTitles, accompPatentsMainTitle, accompPatentsTitles, accompCoursesMainTitle, accompCoursesTitles, accompProjectsMainTitle, accompProjectsTitles, accompTestScoresMainTitle, accompTestScoresTitles, volunteerWorkMainTitle, volunteerWorkTitles, certificationsMainTitle, certificationsTitles, connectionsMainTitle, peopleAlsoViewedMainTitle, peopleAlsoViewedTitles, recommendationsMainTitle, activitiesMainTitle, activitiesTitles, similarlyNamedProfilesMainTitle, similarlyNamedProfilesTitles, articlesMainTitle, articlesTitles, groupsMainTitle, groupsTitles, lastFields);

            Iterator<Alumni> alumniIterator = alumniRepository.findAll().iterator();

            // Iterate over each row of the excel
            int rowIndex=2;
            while (alumniIterator.hasNext()) {
                Alumni alumni = alumniIterator.next();
                Row row = sheet.getRow(rowIndex); // Create a new row
                if (row == null) {
                    row = sheet.createRow(rowIndex);
                }
                
                String linkedinInfo = alumni.getLinkedinInfo();
                int lastWrittenRow = writeAlumniDataToRow(alumni, row, rowIndex, linkedinInfo, sheet, mainTitles, experienceTitles, educationTitles, languageTitle, accompOrganisationsTitles, accompPublicationsTitles, accompHonorsAwardsTitles, accompPatentsTitles,  accompCoursesTitles, accompProjectsTitles, accompTestScoresTitles, volunteerWorkTitles, certificationsTitles, connectionsMainTitle, peopleAlsoViewedTitles, recommendationsMainTitle, activitiesMainTitle, activitiesTitles, similarlyNamedProfilesMainTitle, similarlyNamedProfilesTitles, articlesMainTitle, articlesTitles, groupsMainTitle, groupsTitles, lastFields);

                rowIndex = lastWrittenRow;
            }

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

    private void createHeaders(Sheet sheet, String[] mainTitles, String[] experienceTitles, String[] educationMainTitle, String[] educationTitles, String[] languageTitle, String[] accompOrganisationsMainTitle, String[] accompOrganisationsTitles, String[] accompPublicationsMainTitle, String[] accompPublicationsTitles, String[] accompHonorsAwardsMainTitle, String[] accompHonorsAwardsTitles, String[] accompPatentsMainTitle, String[] accompPatentsTitles, String[] accompCoursesMainTitle, String[] accompCoursesTitles, String[] accompProjectsMainTitle, String[] accompProjectsTitles, String[] accompTestScoresMainTitle, String[] accompTestScoresTitles, String[] accompVolunteerWorkMainTitle, String[] accompVolunteerWorkTitles, String[] certificationsMainTitle, String[] certificationsTitles, String[] connectionsMainTitle, String[] peopleAlsoViewedMainTitle, String[] peopleAlsoViewedTitles, String[] recommendationsMainTitle, String[] activitiesMainTitle, String[] activitiesTitles, String[] similarlyNamedProfilesMainTitle, String[] similarlyNamedProfilesTitles, String[] articlesMainTitle, String[] articlesTitles, String[] groupsMainTitle, String[] groupsTitles, String[] lastFields) {
        createHeaderRow (sheet, 0, 0, mainTitles);
        createHeaderRow (sheet, 1, mainTitles.length-1, experienceTitles);
        createHeaderRow (sheet, 0, (mainTitles.length+experienceTitles.length)-1 , educationMainTitle);
        createHeaderRow (sheet, 1, (mainTitles.length+experienceTitles.length)-1, educationTitles);
        createHeaderRow (sheet, 0, (mainTitles.length+experienceTitles.length+educationTitles.length)-1, languageTitle);
        createHeaderRow (sheet, 0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length)-1, accompOrganisationsMainTitle);
        createHeaderRow (sheet, 1, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length)-1, accompOrganisationsTitles);
        createHeaderRow (sheet, 0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length)-1, accompPublicationsMainTitle);
        createHeaderRow (sheet, 1, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length)-1, accompPublicationsTitles);
        createHeaderRow (sheet, 0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length)-1, accompHonorsAwardsMainTitle);
        createHeaderRow (sheet, 1, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length)-1, accompHonorsAwardsTitles);
        createHeaderRow (sheet, 0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length)-1, accompPatentsMainTitle);
        createHeaderRow (sheet, 1, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length)-1, accompPatentsTitles);
        createHeaderRow (sheet, 0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length)-1, accompCoursesMainTitle);
        createHeaderRow (sheet, 1, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length)-1, accompCoursesTitles);
        createHeaderRow (sheet,0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length)-1, accompProjectsMainTitle);
        createHeaderRow (sheet,1, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length)-1, accompProjectsTitles);
        createHeaderRow (sheet,0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length)-1, accompTestScoresMainTitle);
        createHeaderRow (sheet,1, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length)-1, accompTestScoresTitles);
        createHeaderRow (sheet,0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length)-1, accompVolunteerWorkMainTitle);
        createHeaderRow (sheet,1, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length)-1, accompVolunteerWorkTitles);
        createHeaderRow (sheet,0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length+accompVolunteerWorkTitles.length)-1, certificationsMainTitle);
        createHeaderRow (sheet,1, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length+accompVolunteerWorkTitles.length)-1, certificationsTitles);
        createHeaderRow (sheet,0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length+accompVolunteerWorkTitles.length+certificationsTitles.length)-1, connectionsMainTitle);
        createHeaderRow (sheet,0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length+accompVolunteerWorkTitles.length+certificationsTitles.length+connectionsMainTitle.length)-1, peopleAlsoViewedMainTitle);
        createHeaderRow (sheet,1, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length+accompVolunteerWorkTitles.length+certificationsTitles.length+connectionsMainTitle.length)-1, peopleAlsoViewedTitles);
        createHeaderRow (sheet,0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length+accompVolunteerWorkTitles.length+certificationsTitles.length+connectionsMainTitle.length+peopleAlsoViewedTitles.length)-1, recommendationsMainTitle);
        createHeaderRow (sheet,0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length+accompVolunteerWorkTitles.length+certificationsTitles.length+connectionsMainTitle.length+peopleAlsoViewedTitles.length+recommendationsMainTitle.length)-1, activitiesMainTitle);
        createHeaderRow (sheet,1, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length+accompVolunteerWorkTitles.length+certificationsTitles.length+connectionsMainTitle.length+peopleAlsoViewedTitles.length+recommendationsMainTitle.length)-1, activitiesTitles);
        createHeaderRow (sheet,0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length+accompVolunteerWorkTitles.length+certificationsTitles.length+connectionsMainTitle.length+peopleAlsoViewedTitles.length+recommendationsMainTitle.length+activitiesTitles.length)-1, similarlyNamedProfilesMainTitle);
        createHeaderRow (sheet,1, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length+accompVolunteerWorkTitles.length+certificationsTitles.length+connectionsMainTitle.length+peopleAlsoViewedTitles.length+recommendationsMainTitle.length+activitiesTitles.length)-1, similarlyNamedProfilesTitles);
        createHeaderRow (sheet,0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length+accompVolunteerWorkTitles.length+certificationsTitles.length+connectionsMainTitle.length+peopleAlsoViewedTitles.length+recommendationsMainTitle.length+activitiesTitles.length+similarlyNamedProfilesTitles.length)-1, articlesMainTitle);
        createHeaderRow (sheet,1, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length+accompVolunteerWorkTitles.length+certificationsTitles.length+connectionsMainTitle.length+peopleAlsoViewedTitles.length+recommendationsMainTitle.length+activitiesTitles.length+similarlyNamedProfilesTitles.length)-1, articlesTitles);
        createHeaderRow (sheet,0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length+accompVolunteerWorkTitles.length+certificationsTitles.length+connectionsMainTitle.length+peopleAlsoViewedTitles.length+recommendationsMainTitle.length+activitiesTitles.length+similarlyNamedProfilesTitles.length+articlesTitles.length)-1, groupsMainTitle);
        createHeaderRow (sheet,1, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length+accompVolunteerWorkTitles.length+certificationsTitles.length+connectionsMainTitle.length+peopleAlsoViewedTitles.length+recommendationsMainTitle.length+activitiesTitles.length+similarlyNamedProfilesTitles.length+articlesTitles.length)-1, groupsTitles);
        createHeaderRow (sheet,0, (mainTitles.length+experienceTitles.length+educationTitles.length+languageTitle.length+accompOrganisationsTitles.length+accompPublicationsTitles.length+accompHonorsAwardsTitles.length+accompPatentsTitles.length+accompCoursesTitles.length+accompProjectsTitles.length+accompTestScoresTitles.length+accompVolunteerWorkTitles.length+certificationsTitles.length+connectionsMainTitle.length+peopleAlsoViewedTitles.length+recommendationsMainTitle.length+activitiesTitles.length+similarlyNamedProfilesTitles.length+articlesTitles.length+groupsTitles.length)-1, lastFields);
    }

    // Create a row
    private void createHeaderRow (Sheet sheet, int rowIndex, int startColumn, String[] titles) {
        Row headerRow = sheet.getRow(rowIndex); // Create a new row
        if (headerRow == null) {
            headerRow = sheet.createRow(rowIndex);
        }
        for (int i=0; i<titles.length; i++) {
            Cell cell = headerRow.createCell(startColumn);
            cell.setCellValue(titles[i]);
            startColumn++;
        }
    }

    // Writes the alumni data to the row
    private int writeAlumniDataToRow (Alumni alumni, Row row, int rowIndex, String linkedinInfo, Sheet sheet, String[] mainTitles, String[] experienceTitles, String[] educationTitles, String[] languageTitle, String[] accompOrganisationsTitles, String[] accompPublicationsTitles, String[] accompHonorsAwardsTitles, String[] accompPatentsTitles,  String[] accompCoursesTitles, String[] accompProjectsTitles, String[] accompTestScoresTitles, String[] volunteerWorkTitles, String[] certificationsTitles, String[] connectionsMainTitle, String[] peopleAlsoViewedTitles, String[] recommendationsMainTitle, String[] activitiesMainTitle, String[] activitiesTitles, String[] similarlyNamedProfilesMainTitle, String[] similarlyNamedProfilesTitles, String[] articlesMainTitle, String[] articlesTitles, String[] groupsMainTitle, String[] groupsTitles, String[] lastFields) {
        String linkdeinLink = alumni.getLinkedinLink();
        Cell cellLinkedinLink = row.createCell(0);  // Write linkedin link to column 1
        cellLinkedinLink.setCellValue(linkdeinLink);
        int rowIndexExperienceBackup = 0;
        int rowIndexEducationBackup = 0;
        int rowIndexOrganizationsBackup = 0;
        int rowIndexPublicationsBackup = 0;
        int rowIndexHonorAwardsBackup = 0;
        int rowIndexAccompPattentsBackup = 0;
        int rowIndexAccompCoursesBackup = 0;
        int rowIndexAccompProjectsBackup = 0;
        int rowIndexAccompTestScoreBackup = 0;
        int rowIndexVolunteerWorkBackup = 0;
        int rowIndexCertificatesBackup = 0;

        // ----- Writes the first main titles -----
        int columnIndex = 1;
        for (int i=1; i<mainTitles.length; i++) {
            String fieldValue = FilesHandler.extractFieldFromJson(mainTitles[i], linkedinInfo);
            Cell cell = row.createCell(columnIndex); 
            cell.setCellValue(fieldValue);
            columnIndex++;
        }

        // ----- Writes the experience information  ----- 
        List<ObjectNode> experiencesList = FilesHandler.getExperienceDetails(linkedinInfo);
        int lastColumnIndex = mainTitles.length - 1; // Gets the index of the last column of the first header 
        rowIndexExperienceBackup = rowIndex;
        // Write values from experiencesList under experienceTitles
        for (ObjectNode experience : experiencesList) {
            // Create a new row
            Row rowExperience = sheet.getRow(rowIndexExperienceBackup);
            if (rowExperience == null) {
                rowExperience = sheet.createRow(rowIndexExperienceBackup);
            }
            // write each field from the experience object to corresponding cell
            String fieldValue = experience.get("time").asText();
            Cell cell = rowExperience.createCell(lastColumnIndex);
            cell.setCellValue(fieldValue);

            for (int i=1; i<experienceTitles.length; i++) {
                String fieldName = experienceTitles[i];
                fieldValue = experience.get(fieldName).asText();
                cell = rowExperience.createCell(lastColumnIndex + i);
                cell.setCellValue(fieldValue);
            }
            rowIndexExperienceBackup++;
        }

        // ----- Writes the education information ----- 
        List<ObjectNode> educationList = FilesHandler.getEducationDetails(linkedinInfo);
        lastColumnIndex = (mainTitles.length + experienceTitles.length)-1;
        rowIndexEducationBackup = rowIndex;
        // Writes values from educationList under educationTitles
        for (ObjectNode education : educationList) {
            // Create a new row
            Row rowEducation = sheet.getRow(rowIndexEducationBackup);
            if (rowEducation == null) {
                rowEducation = sheet.createRow(rowIndexEducationBackup);
            }
            // write each field from the education object to corresponding cell
            String fieldValue = education.get("time").asText();
            Cell cell = rowEducation.createCell(lastColumnIndex);
            cell.setCellValue(fieldValue);

            for (int i=1; i<educationTitles.length; i++) {
                String fieldName = educationTitles[i];
                fieldValue = education.get(fieldName).asText();
                cell = rowEducation.createCell(lastColumnIndex + i);
                cell.setCellValue(fieldValue);
            }
            rowIndexEducationBackup++;
        } 

        // Starts to fill the education cells with - so that they don't get down the links
        while (rowIndexEducationBackup != rowIndexExperienceBackup && rowIndexEducationBackup < rowIndexExperienceBackup) {
            // Create a new row
            Row rowEducation = sheet.getRow(rowIndexEducationBackup);
            if (rowEducation == null) {
                rowEducation = sheet.createRow(rowIndexEducationBackup);
            }
            // write each field from the education object to corresponding cell
            Cell cell = rowEducation.createCell(lastColumnIndex);
            cell.setCellValue("-");

            cell = rowEducation.createCell(lastColumnIndex);
            cell.setCellValue("-");

            rowIndexEducationBackup++;
        }

        // ----- Writes the languages ----- 
        lastColumnIndex = (mainTitles.length + experienceTitles.length + educationTitles.length)-1;
        String fieldValueLanguage = FilesHandler.extractFieldFromJson("languages", linkedinInfo);
        Cell cellLanguage = row.createCell(lastColumnIndex); 
        cellLanguage.setCellValue(fieldValueLanguage);

        // ----- Writes the Accomplishment Organisations  ----- 
        List<ObjectNode> accompOrganisations = FilesHandler.getAccompOrganisationsDetails(linkedinInfo);
        lastColumnIndex = (mainTitles.length + experienceTitles.length + educationTitles.length + 1)-1; // +1 comes from the "languages" column
        rowIndexOrganizationsBackup = rowIndex;
        // Writes values from accompOrganizsations under accompOrganisationsTitles 
        for (ObjectNode accompOrganisation : accompOrganisations) {
            // Create a new row
            Row rowOrganization = sheet.getRow(rowIndexOrganizationsBackup);
            if (rowOrganization == null) {
                rowOrganization = sheet.createRow(rowIndexOrganizationsBackup);
            }
            // write each field from the organization object to corresponding cell
            String fieldValue = accompOrganisation.get("time").asText();
            Cell cell = rowOrganization.createCell(lastColumnIndex);
            cell.setCellValue(fieldValue);

            for (int i=1; i<accompOrganisationsTitles.length; i++) {
                String fieldName = accompOrganisationsTitles[i];
                fieldValue = accompOrganisation.get(fieldName).asText();
                cell = rowOrganization.createCell(lastColumnIndex + i);
                cell.setCellValue(fieldValue);
            }
            rowIndexOrganizationsBackup++;
        }

        // ----- Writes the Accomplishment Publications  ----- 
        List<ObjectNode> accompPublications = FilesHandler.getAccompPublicationsDetails(linkedinInfo);
        lastColumnIndex = (mainTitles.length + experienceTitles.length + educationTitles.length + 1 + accompOrganisationsTitles.length)-1; // +1 comes from the "languages" column
        rowIndexPublicationsBackup = rowIndex;
        // Writes values from accompPublications under accompPublicationsTitles 
        for (ObjectNode accompPublication : accompPublications) {
            // Create a new row
            Row rowPublication = sheet.getRow(rowIndexPublicationsBackup);
            if (rowPublication == null) {
                rowPublication = sheet.createRow(rowIndexPublicationsBackup);
            }
            // write each field from the publication object to corresponding cell
            for (int i=0; i<accompPublicationsTitles.length; i++) {
                String fieldName = accompPublicationsTitles[i];
                String fieldValue = accompPublication.get(fieldName).asText();
                Cell cell = rowPublication.createCell(lastColumnIndex + i);
                cell.setCellValue(fieldValue);
            }
            rowIndexPublicationsBackup++;
        }

        // ----- Writes the Accomplishment Awards  ----- 
        List<ObjectNode> accompHonorsAwards = FilesHandler.getAccompHonorsAwardsDetails(linkedinInfo);
        lastColumnIndex = (mainTitles.length + experienceTitles.length + educationTitles.length + 1 + accompOrganisationsTitles.length + accompPublicationsTitles.length)-1; // +1 comes from the "languages" column
        rowIndexHonorAwardsBackup = rowIndex;
        // Writes values from accompPublications under accompPublicationsTitles 
        for (ObjectNode accompHonorsAward : accompHonorsAwards) {
            // Create a new row
            Row rowHonorsAwards = sheet.getRow(rowIndexHonorAwardsBackup);
            if (rowHonorsAwards == null) {
                rowHonorsAwards = sheet.createRow(rowIndexHonorAwardsBackup);
            }
            // write each field from the publication object to corresponding cell
            for (int i=0; i<accompHonorsAwardsTitles.length; i++) {
                String fieldName = accompHonorsAwardsTitles[i];
                String fieldValue = accompHonorsAward.get(fieldName).asText();
                Cell cell = rowHonorsAwards.createCell(lastColumnIndex + i);
                cell.setCellValue(fieldValue);
            }
            rowIndexHonorAwardsBackup++;
        }

        // ----- Writes the Accomplishment Pattents  ----- 
        List<ObjectNode> accompPattents = FilesHandler.getAccompPatentsDetails(linkedinInfo);
        lastColumnIndex = (mainTitles.length + experienceTitles.length + educationTitles.length + 1 + accompOrganisationsTitles.length + accompPublicationsTitles.length + accompHonorsAwardsTitles.length)-1; // +1 comes from the "languages" column
        rowIndexAccompPattentsBackup = rowIndex;
        // Writes values from accompPublications under accompPublicationsTitles 
        for (ObjectNode accompPattent : accompPattents) {
            // Create a new row
            Row rowPattents = sheet.getRow(rowIndexAccompPattentsBackup);
            if (rowPattents == null) {
                rowPattents = sheet.createRow(rowIndexAccompPattentsBackup);
            }
            // write each field from the publication object to corresponding cell
            for (int i=0; i<accompPatentsTitles.length; i++) {
                String fieldName = accompPatentsTitles[i];
                String fieldValue = accompPattent.get(fieldName).asText();
                Cell cell = rowPattents.createCell(lastColumnIndex + i);
                cell.setCellValue(fieldValue);
            }
            rowIndexAccompPattentsBackup++;
        }

        // ----- Writes the Accomplishment Courses  ----- 
        List<ObjectNode> accompCourses = FilesHandler.getAccompCoursesDetails(linkedinInfo);
        lastColumnIndex = (mainTitles.length + experienceTitles.length + educationTitles.length + 1 + accompOrganisationsTitles.length + accompPublicationsTitles.length + accompHonorsAwardsTitles.length + accompPatentsTitles.length)-1; // +1 comes from the "languages" column
        rowIndexAccompCoursesBackup = rowIndex;
        // Writes values from accompPublications under accompPublicationsTitles 
        for (ObjectNode accompCourse : accompCourses) {
            // Create a new row
            Row rowCourse = sheet.getRow(rowIndexAccompCoursesBackup);
            if (rowCourse == null) {
                rowCourse = sheet.createRow(rowIndexAccompCoursesBackup);
            }
            // write each field from the publication object to corresponding cell
            for (int i=0; i<accompCoursesTitles.length; i++) {
                String fieldName = accompCoursesTitles[i];
                String fieldValue = accompCourse.get(fieldName).asText();
                Cell cell = rowCourse.createCell(lastColumnIndex + i);
                cell.setCellValue(fieldValue);
            }
            rowIndexAccompCoursesBackup++;
        }

        // ----- Writes the Accomplishment Projects  ----- 
        List<ObjectNode> accompProjects = FilesHandler.getAccompProjectsDetails(linkedinInfo);
        lastColumnIndex = (mainTitles.length + experienceTitles.length + educationTitles.length + 1 + accompOrganisationsTitles.length + accompPublicationsTitles.length + accompHonorsAwardsTitles.length + accompPatentsTitles.length + accompCoursesTitles.length)-1; // +1 comes from the "languages" column
        rowIndexAccompProjectsBackup = rowIndex;
        // Writes values from accompProjects under accompProjectsTitles 
        for (ObjectNode accompProject : accompProjects) {
            // Create a new row
            Row rowProject = sheet.getRow(rowIndexAccompProjectsBackup);
            if (rowProject == null) {
                rowProject = sheet.createRow(rowIndexAccompProjectsBackup);
            }
            // write each field from the publication object to corresponding cell
            for (int i=0; i<accompProjectsTitles.length; i++) {
                String fieldName = accompProjectsTitles[i];
                String fieldValue = accompProject.get(fieldName).asText();
                Cell cell = rowProject.createCell(lastColumnIndex + i);
                cell.setCellValue(fieldValue);
            }
            rowIndexAccompProjectsBackup++;
        }

        // ----- Writes the Accomplishment Test Scores  ----- 
        List<ObjectNode> accompTestScores = FilesHandler.getAccompTestScoresDetails(linkedinInfo);
        lastColumnIndex = (mainTitles.length + experienceTitles.length + educationTitles.length + 1 + accompOrganisationsTitles.length + accompPublicationsTitles.length + accompHonorsAwardsTitles.length + accompPatentsTitles.length + accompCoursesTitles.length + accompProjectsTitles.length)-1; // +1 comes from the "languages" column
        rowIndexAccompTestScoreBackup = rowIndex;
        // Writes values from accompProjects under accompProjectsTitles 
        for (ObjectNode accompTestScore : accompTestScores) {
            // Create a new row
            Row rowTestScore = sheet.getRow(rowIndexAccompTestScoreBackup);
            if (rowTestScore == null) {
                rowTestScore = sheet.createRow(rowIndexAccompTestScoreBackup);
            }
            // write each field from the publication object to corresponding cell
            for (int i=0; i<accompTestScoresTitles.length; i++) {
                String fieldName = accompTestScoresTitles[i];
                String fieldValue = accompTestScore.get(fieldName).asText();
                Cell cell = rowTestScore.createCell(lastColumnIndex + i);
                cell.setCellValue(fieldValue);
            }
            rowIndexAccompTestScoreBackup++;
        }

        // ----- Writes the Volunter Work  ----- 
        List<ObjectNode> volunteerWorks = FilesHandler.getVolunterWorksDetails(linkedinInfo);
        lastColumnIndex = (mainTitles.length + experienceTitles.length + educationTitles.length + 1 + accompOrganisationsTitles.length + accompPublicationsTitles.length + accompHonorsAwardsTitles.length + accompPatentsTitles.length + accompCoursesTitles.length + accompProjectsTitles.length + accompTestScoresTitles.length)-1; // +1 comes from the "languages" column
        rowIndexVolunteerWorkBackup = rowIndex;
        // Writes values from volunteerWorks under volunteerWorksTitles 
        for (ObjectNode volunteerWork : volunteerWorks) {
            // Create a new row
            Row rowVolunteerWorks = sheet.getRow(rowIndexVolunteerWorkBackup);
            if (rowVolunteerWorks == null) {
                rowVolunteerWorks = sheet.createRow(rowIndexVolunteerWorkBackup);
            }
            // write each field from the publication object to corresponding cell
            for (int i=0; i<volunteerWorkTitles.length; i++) {
                String fieldName = volunteerWorkTitles[i];
                String fieldValue = volunteerWork.get(fieldName).asText();
                Cell cell = rowVolunteerWorks.createCell(lastColumnIndex + i);
                cell.setCellValue(fieldValue);
            }
            rowIndexVolunteerWorkBackup++;
        }

        // ----- Writes the certifications  ----- 
        List<ObjectNode> certifications = FilesHandler.getCertificationsDetails(linkedinInfo);
        lastColumnIndex = (mainTitles.length + experienceTitles.length + educationTitles.length + 1 + accompOrganisationsTitles.length + accompPublicationsTitles.length + accompHonorsAwardsTitles.length + accompPatentsTitles.length + accompCoursesTitles.length + accompProjectsTitles.length + accompTestScoresTitles.length + volunteerWorkTitles.length)-1; // +1 comes from the "languages" column
        rowIndexCertificatesBackup = rowIndex;
        // Writes values from certifications under certificationsTitles 
        for (ObjectNode certification : certifications) {
            // Create a new row
            Row rowCertifications = sheet.getRow(rowIndexCertificatesBackup);
            if (rowCertifications == null) {
                rowCertifications = sheet.createRow(rowIndexCertificatesBackup);
            }
            // write each field from the publication object to corresponding cell
            for (int i=0; i<certificationsTitles.length; i++) {
                String fieldName = certificationsTitles[i];
                String fieldValue = certification.get(fieldName).asText();
                Cell cell = rowCertifications.createCell(lastColumnIndex + i);
                cell.setCellValue(fieldValue);
            }
            rowIndexCertificatesBackup++;
        }

        // Returns the last written row
        int[] rowIndexes = {rowIndexExperienceBackup, rowIndexEducationBackup, rowIndexOrganizationsBackup, rowIndexPublicationsBackup, rowIndexHonorAwardsBackup, rowIndexAccompPattentsBackup, rowIndexAccompCoursesBackup, rowIndexAccompProjectsBackup, rowIndexAccompTestScoreBackup, rowIndexVolunteerWorkBackup, rowIndexCertificatesBackup};
        int maxRowIndex = Arrays.stream(rowIndexes).max().orElse(-1);
        if (maxRowIndex == -1) {
            System.out.println("ERROR: maxIndex couldn't find the max value!!!");
        }
        return maxRowIndex;
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
    public byte[] matchLinksToAlumnis(MultipartFile file) {
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
