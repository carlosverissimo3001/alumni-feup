package com.feupAlumni.alumniFEUP.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.handlers.FilesHandler;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.ArrayList;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;

import java.util.Iterator;
import java.util.Collections;

@Service
public class ApiDataAnalysisServiceImpl implements ApiDataAnalysisService {

    @Autowired
    private AlumniRepository alumniRepository;

    boolean test = false;

    @Override
    public byte[] alumniTableToExcel(MultipartFile file) {

        // Load the Excel file
        try (InputStream inputStream = file.getInputStream()) {
            // Read and iterate over the excel file
            Workbook workbook = new XSSFWorkbook(inputStream);

            Sheet sheet = workbook.getSheetAt(0);   // 1st sheet
            // 1st on the sublist is the row where which title should be 
            String[][] fields = {
                {"0", "Not_Subtitles","Linkedin Link", "public_identifier", "profile_pic_url", "background_cover_image_url", "first_name", "last_name", "full_name", "follower_count", "occupation", "headline", "summary", "country", "country_full_name", "city", "state"},
                {"0", "Has_Subtitles", "experiences"},
                {"1", "Expirience_Subtitle", "time", "company", "company_linkedin_profile_url", "title", "description", "location", "logo_url"},
                {"0", "Not_Subtitles", "education"},
                {"1", "Education_Subtitle", "time", "field_of_study", "degree_name", "school", "school_linkedin_profile_url", "description", "logo_url", "grade", "activities_and_societies"},
                {"0", "Not_Subtitles", "languages"},
                {"0", "Has_Subtitles", "accomplishment_organisations"},
                {"1", "AccomplishmentOrganisations_subtitle", "time", "org_name", "title", "description"},
                {"0", "Has_Subtitles", "accomplishment_publications"},
                {"1", "AccomplishmentPublications_subtitle", "name", "publisher", "published_on", "description", "url"},
                {"0", "Has_Subtitles", "accomplishment_honors_awards"},
                {"1", "AccomplishmentHonorsAwards_subtitle", "title", "issuer", "issued_on", "description"},
                {"0", "Has_Subtitles", "accomplishment_patents"},
                {"1", "AccomplishmentPatents_subtitle", "title", "issuer", "issued_on", "description", "application_number", "patent_number", "url"},
                {"0", "Has_Subtitles", "accomplishment_courses"},
                {"1", "AccomplishmentCourses_subtitle", "name", "number"},
                {"0", "Has_Subtitles", "accomplishment_projects"},
                {"1", "AccomplishmentProjects_subtitle", "time", "title", "description", "url"},
                {"0", "Has_Subtitles", "accomplishment_test_scores"},
                {"1", "AccomplishmentTestScores_subtitle", "name", "score", "date_on", "description"},
                {"0", "Has_Subtitles", "volunteer_work"},
                {"1", "VolunteerWork_subtitle", "time", "title", "cause", "company", "company_linkedin_profile_url", "description", "logo_url"},
                {"0", "Has_Subtitles", "certifications"},
                {"1", "Certifications_Subtitle", "time", "name", "license_number", "display_source", "authority", "url"},
                {"0", "Not_Subtitles", "connections"},
                {"0", "Has_Subtitles", "people_also_viewed"}, 
                {"1", "PeopleAlsoViewed_subtitle", "link", "name", "summary", "location"},
                {"0", "Not_Subtitles", "recommendations"},
                {"0", "Has_Subtitles", "activities"},
                {"1", "Activities_subtitle", "title", "link", "activity_status"},
                {"0", "Has_Subtitles", "similarly_named_profiles"},
                {"1", "SimilarlyNamedProfiles_subtitle", "name", "link", "summary", "location"},
                {"0", "Has_Subtitles", "articles"},
                {"1", "Articles_subtitle", "title", "link", "published_date", "author", "image_url"},
                {"0", "Has_Subtitles", "groups"},
                {"1", "Groups_Subtitle", "profile_pic_url", "name", "url"},
                {"0", "Not_Subtitles", "skills", "inferred_salary", "gender", "birth_date", "industry", "extra", "interests", "personal_emails", "personal_numbers"}
            };
            
            // Write Excel Titles
            createHeaders(sheet, fields);

            // Iterate over each row of the excel
            Iterator<Alumni> alumniIterator = alumniRepository.findAll().iterator();
            int rowIndex=2;
            while (alumniIterator.hasNext()) {
                Alumni alumni = alumniIterator.next();
                String linkedinInfo = alumni.getLinkedinInfo();

                int lastWrittenRow = writeAlumniDataToRow(alumni, rowIndex, linkedinInfo, sheet, fields);

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

    private void createHeaders(Sheet sheet, String[][] fields) {
        var columnCounter = 0;
        for (int i=0; i<fields.length; i++) {
            createHeaderRow(sheet, Integer.parseInt(fields[i][0]), columnCounter, fields[i]);
            columnCounter = (columnCounter + (fields[i].length-2)); // fields[i].length-2 because the first 2 positions are not titles
        }
    }

    // Create a row
    private void createHeaderRow (Sheet sheet, int rowIndex, int startColumn, String[] titles) {
        Row headerRow = sheet.getRow(rowIndex); // Create a new row
        if (headerRow == null) {
            headerRow = sheet.createRow(rowIndex);
        }
        for (int i=2; i<titles.length; i++) {
            Cell cell = headerRow.createCell(startColumn);
            cell.setCellValue(titles[i]);
            startColumn++;
        }
    }

    // Writes the main titles. Returns the last written row. 
    private int writeFieldMainTitleContent (Alumni alumni, Sheet sheet, int rowIndex, int columnIndex, String[] titles, String linkedinInfo) {
       int lastWrittenRow = rowIndex;       
        // Create a new row
        Row row = sheet.getRow(rowIndex); 
        if (row == null) {
            row = sheet.createRow(rowIndex);
        }
        for (int i=2; i<titles.length; i++) {
            if (titles[i] != "Linkedin Link") {
                String fieldValue = FilesHandler.extractFieldFromJson(titles[i], linkedinInfo);
                Cell cell = row.createCell(columnIndex); 
                cell.setCellValue(fieldValue);
                columnIndex++;
            } else {
                String linkdeinLink = alumni.getLinkedinLink();
                Cell cellLinkedinLink = row.createCell(0);  // Write linkedin link to column 1
                cellLinkedinLink.setCellValue(linkdeinLink);
            }
        }
        lastWrittenRow++;
        return lastWrittenRow;
    }

    // Writes the sub titles. Returns the last written row
    private int writeFieldSubtitleContent (Sheet sheet, List<ObjectNode> valuesSubtitles, String[] titles, int columnIndex, int rowIndex) {
        int lastWrittenRow = rowIndex;
        // Write values from experiencesList under experienceTitles
        for (ObjectNode valueSubtitles : valuesSubtitles) {
            // Create a new row
            Row rowExperience = sheet.getRow(lastWrittenRow);
            if (rowExperience == null) {
                rowExperience = sheet.createRow(lastWrittenRow);
            }

            for (int i=2; i<titles.length; i++) {
                String fieldName = titles[i];
                String fieldValue = valueSubtitles.get(fieldName).asText();
                Cell cell = rowExperience.createCell(columnIndex + (i-2)); // i-2 because I want to start on the write length of the fields before
                cell.setCellValue(fieldValue);
            }
            lastWrittenRow++;
        }
        return lastWrittenRow;
    }

    // Writes the alumni data to the row
    private int writeAlumniDataToRow (Alumni alumni, int rowIndex, String linkedinInfo, Sheet sheet, String[][] fields) {
        try {
            int columnIndex = 1;
            List<Integer> lastRowsWritten = new ArrayList<>();     
            for (int i=0; i<fields.length; i++) {
                Integer lastWrittenRow = 0;
                if (fields[i][1] != "Has_Subtitles") { 
                    if (fields[i][0] == "0") {
                        lastWrittenRow = writeFieldMainTitleContent(alumni, sheet, rowIndex, columnIndex, fields[i], linkedinInfo);
                    } else {
                        List<ObjectNode> valuesSubtitles = new ArrayList<>();
                        switch (fields[i][1]) {
                            case "Expirience_Subtitle":
                                valuesSubtitles = FilesHandler.getExperienceDetails(linkedinInfo);
                                break;
                            case "Education_Subtitle":
                                valuesSubtitles = FilesHandler.getEducationDetails(linkedinInfo);
                                break;
                            case "AccomplishmentOrganisations_subtitle":
                                valuesSubtitles = FilesHandler.getAccompOrganisationsDetails(linkedinInfo);
                                break;
                            case "AccomplishmentPublications_subtitle":
                                valuesSubtitles = FilesHandler.getAccompPublicationsDetails(linkedinInfo);
                                break;
                            case "AccomplishmentHonorsAwards_subtitle":
                                valuesSubtitles = FilesHandler.getAccompHonorsAwardsDetails(linkedinInfo);
                                break;
                            case "AccomplishmentPatents_subtitle":
                                valuesSubtitles = FilesHandler.getAccompPatentsDetails(linkedinInfo);
                                break;
                            case "AccomplishmentCourses_subtitle":
                                valuesSubtitles = FilesHandler.getAccompCoursesDetails(linkedinInfo);
                                break;
                            case "AccomplishmentProjects_subtitle":
                                valuesSubtitles = FilesHandler.getAccompProjectsDetails(linkedinInfo);
                                break;
                            case "AccomplishmentTestScores_subtitle":
                                valuesSubtitles = FilesHandler.getAccompTestScoresDetails(linkedinInfo);
                                break;
                            case "VolunteerWork_subtitle":
                                valuesSubtitles = FilesHandler.getVolunterWorksDetails(linkedinInfo);
                                break;
                            case "Certifications_Subtitle":
                                valuesSubtitles = FilesHandler.getCertificationsDetails(linkedinInfo);
                                break;
                            case "PeopleAlsoViewed_subtitle":
                                valuesSubtitles = FilesHandler.getPeopleAlsoViewedDetails(linkedinInfo);
                                break;
                            case "Activities_subtitle":
                                valuesSubtitles = FilesHandler.getActivitiesDetails(linkedinInfo);
                                break;
                            case "SimilarlyNamedProfiles_subtitle":
                                valuesSubtitles = FilesHandler.getSimilarlyNamedProfilesDetails(linkedinInfo);
                                break;
                            case "Articles_subtitle":
                                valuesSubtitles = FilesHandler.getArticlesDetails(linkedinInfo);
                                break;
                            case "Groups_Subtitle":
                                valuesSubtitles = FilesHandler.getGroupsDetails(linkedinInfo);
                                break;
                            default:
                                System.out.println("TITLE NOT VALID");
                        }
                        lastWrittenRow = writeFieldSubtitleContent(sheet, valuesSubtitles, fields[i], columnIndex, rowIndex);
                    }
                    lastRowsWritten.add(lastWrittenRow);
                    if (columnIndex == 1) {
                        columnIndex = (columnIndex + (fields[i].length-2)) - 1; // fields[i].length-2 because the first 2 positions are not title. Decrements 1 in the first iteration so it starts the count with value 0
                    } else {
                        columnIndex = (columnIndex + (fields[i].length-2)); // fields[i].length-2 because the first 2 positions are not title
                    }
                } else {
                    columnIndex++;
                }
            }
            // Returns the last written row
            int maxValue = Collections.max(lastRowsWritten);  
            return maxValue;
        } catch (Exception e) {
            System.out.println("Exception: " + e);
            return 0;
        }
    }
}
