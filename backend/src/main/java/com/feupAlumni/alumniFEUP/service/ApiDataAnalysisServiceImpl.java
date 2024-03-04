package com.feupAlumni.alumniFEUP.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.handlers.FilesHandler;
import com.feupAlumni.alumniFEUP.handlers.ManageApiData;
import com.feupAlumni.alumniFEUP.handlers.CleanData;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.ArrayList;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;

import java.util.Iterator;
import java.util.Collections;
import java.util.HashMap;

@Service
public class ApiDataAnalysisServiceImpl implements ApiDataAnalysisService {

    @Autowired
    private AlumniRepository alumniRepository;
    private int invalidAlumnisSchoolCount = 0;
    private int invalidAlumnisYearStartCount = 0;
    private int studentNotMatchedByName = 0;
    private int linkedinLinksMultipleMatched = 0;
    private int successfullMatches = 0;
    private int countAlumnisLinkedinLinks = 0; // counts the linkedin links that are being excluded and included
    private int studentMatchedMore1Alumni = 0;
    private int studentNotMatchLinkPrev = 0;

    @Override
    public byte[] alumniTableToExcel(MultipartFile file) {
        // Load the Excel file
        Workbook workbook = null;
        try (InputStream inputStream = file.getInputStream()) {
            // Read and iterate over the excel file
            workbook = new XSSFWorkbook(inputStream);

            Sheet sheet = workbook.getSheetAt(0);   // 1st sheet
            // 1st on the sublist is the row where which title should be 
            String[][] fields = ManageApiData.getFields();
            
            // Write Excel Titles
            createHeaders(sheet, fields);

            // Iterate over each row of the excel and writes the content of the tiles written before
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
        } finally {
            // Close the workbook in the finally block to ensure it's always closed
            if (workbook != null) {
                try {
                    workbook.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    @Override
    public byte[] excelAlumnProfSitu(MultipartFile file) {
        // Load the Excel file
        Workbook workbook = null;
        try (InputStream inputStream = file.getInputStream()) {
            // Read and iterate over the excel file
            workbook = new XSSFWorkbook(inputStream);
            Sheet sheet = workbook.getSheetAt(0);   // 1st sheet

            // Iterate over each row of the excel
            int rowIndex=0;
            Iterator<Alumni> alumniIterator = alumniRepository.findAll().iterator();
            Map<String, Integer> occupationCount = new HashMap<>();
            while (alumniIterator.hasNext()) {
                Alumni alumni = alumniIterator.next();
                String linkedinInfo = alumni.getLinkedinInfo();
                String fullName = FilesHandler.extractFieldFromJson("full_name", linkedinInfo);
                String occupation = FilesHandler.extractFieldFromJson("occupation", linkedinInfo);
                // Takes out the location
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
        } finally {
            // Close the workbook in the finally block to ensure it's always closed
            if (workbook != null) {
                try {
                    workbook.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    @Override
    public byte[] matchLinksToStudents(MultipartFile file) {
        Workbook workbook = null;
        try (InputStream inputStream = file.getInputStream()) {
            // Prepares a hash map. The key is the yearStart/yearConclusion and the value is an Array of Alumnis
            HashMap<String, List<Alumni>> alumnisPerYearMap = alumnisPerYearMap();

            workbook = new XSSFWorkbook(inputStream);
            Sheet sheet = workbook.getSheetAt(0);   
            Iterator<Row> rowIterator = sheet.iterator();

            ArrayList<String> linksMultipleMatched = new ArrayList<>(); // Linkedin Links excluded because they were matched with more than 1 person
            Map<Row, String> rowAndItsLink = new HashMap<>();           // Linkedin Links and the rows they were puted in

            // For each row in the excel file, this is, for each student
            while (rowIterator.hasNext()) {
                try {
                    Row row = rowIterator.next();

                    // Gets the 1st year start in FEUP (no metter what course is)
                    String[] studentYearsStart = {
                        row.getCell(5).getStringCellValue().trim(),    // Column F
                        row.getCell(7).getStringCellValue().trim(),    // Column H
                        row.getCell(9).getStringCellValue().trim(),    // Column J
                        row.getCell(11).getStringCellValue().trim(),   // Column L
                        row.getCell(13).getStringCellValue().trim()    // Column N
                    };

                    String studentYearStartFound = "";
                    for (String studentYearStart : studentYearsStart) {
                        if (!studentYearStart.isEmpty()) {
                            studentYearStartFound = studentYearStart.split("/")[0];
                            break;
                        }
                    }

                    // Grabs the alumni list that started in the same year 
                    List<Alumni> alumniListYearStart = alumnisPerYearMap.get(studentYearStartFound);
                    if (row.getCell(1) != null && row.getCell(1).getStringCellValue().trim().equals("Nuno Honório Rodrigues Flores")) {
                        System.out.println("studentYearStartFound: " + studentYearStartFound);
                        for (Alumni alumni : alumniListYearStart) {
                            System.out.println("alumniListYearStart: " + FilesHandler.extractFieldFromJson("full_name", alumni.getLinkedinInfo()));
                        }
                    }
                    List<Alumni> matchedAlumnis = new ArrayList<>();
                    if (alumniListYearStart != null) {
                        for (Alumni alumni : alumniListYearStart) {
                            boolean matchedName = CleanData.validAlumniName(alumni, row.getCell(1).getStringCellValue().trim()); // second argument is the name of the student
                            if (matchedName) {
                                matchedAlumnis.add(alumni);
                            }
                        }
                    }
                    
                    if (matchedAlumnis.size() == 0) { // No alumnis were matched with the current user (by their names)
                        // Increments the number of students not able to match because no name found
                        //System.out.println("### No linkedin link was matched with the user (no matched name): " +  row.getCell(1).getStringCellValue().trim() + " ###");
                        studentNotMatchedByName++;
                    } else if (matchedAlumnis.size() == 1) { // elegible to be matched
                        boolean linkPrevMatched = linkedinLinkConisderedPrevMatched(linksMultipleMatched, matchedAlumnis.get(0).getLinkedinLink()); 
                        if (!linkPrevMatched) { // If the linkedin was not considered previously matched
                            Row rowFoundWithLink = verifyLinkedinLinkAvailability(rowAndItsLink, matchedAlumnis.get(0).getLinkedinLink()); // Verifies if the linkedin link was already associated with another person
                            if (rowFoundWithLink == null) { // Linkedin link was NOT previously associated
                                // Writes the link in the Excel Sheet
                                Cell linkLinkedIn = row.createCell(3); // Column DmatchLinks
                                linkLinkedIn.setCellValue(matchedAlumnis.get(0).getLinkedinLink());
    
                                // Adds the row and the linkedin so next iterations are able to see that this link was already associated
                                rowAndItsLink.put(row, matchedAlumnis.get(0).getLinkedinLink());
                                successfullMatches++;
                            } else {
                                linksMultipleMatched.add(matchedAlumnis.get(0).getLinkedinLink()); // Adds the linkedin link to a list of multiple matched
                                rowAndItsLink.remove(rowFoundWithLink); // deletes the row associated with that link from the map
    
                                // Deletes from Excel (in this row) the associated link
                                Cell foundedRowWithSameLink = rowFoundWithLink.createCell(3);
                                foundedRowWithSameLink.setCellValue((String) null);
                            
                                // Increments the number of students not able to match because no name found
                                System.out.println("=== The linkedin link: " + matchedAlumnis.get(0).getLinkedinLink() + " was multiple matched ===.");
                                linkedinLinksMultipleMatched++;
                            }
                        } else {
                            // Increments the number of students not
                            String fullName = row.getCell(1).getStringCellValue().trim();
                            System.out.println("<<< The student: " + fullName + " was not matched with a linkedin link because the linkedin link was already considered multple matched");
                            studentNotMatchLinkPrev++;
                        }
                    } else {
                        // Increments the number of alumnis with invalid schools so it can later be printed
                        String fullName = row.getCell(1).getStringCellValue().trim();
                        System.out.println(">>> Student not matched because more than 1 linkedin link matched with the Student name . Student: " +  fullName + " >>>");
                        studentMatchedMore1Alumni++;  
                    }   
                } catch (Exception error) {
                    System.out.println("error: " + error);
                } 
            }

            System.out.println("------------- Summary: -------------");
            System.out.println("Invalid alumnis because of invalid school: " + invalidAlumnisSchoolCount + " (!!!).");
            System.out.println("Invalid alumnis because of invalid year start: " + invalidAlumnisYearStartCount + " (---).");
            System.out.println("Students not matched by names: " + studentNotMatchedByName + " (###).");
            System.out.println("Linkedin links multiple matched: " + linkedinLinksMultipleMatched + " (===).");
            System.out.println("Students not matched because more than 1 linkedin link matched with the Student name: " + studentMatchedMore1Alumni + " (>>>).");
            System.out.println("Student was not matched because the linkedin link was already considered previously matched: " + studentNotMatchLinkPrev + " (<<<).");
            System.out.println("Successfull matches: " + successfullMatches + " (///).");
            System.out.println("Considered linkedin links: " + countAlumnisLinkedinLinks + " macthed: " + successfullMatches + ". Without matches: " + (countAlumnisLinkedinLinks-successfullMatches) + ". Success percentage: " + ((successfullMatches*100)/830) + "%");
            System.out.println("------------------------------------");

            // Save the modified workbook to a byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            byte[] modifiedExcelBytes = outputStream.toByteArray();
            return modifiedExcelBytes;
        } catch (IOException e) {
            e.printStackTrace();
            return null; 
        } finally {
            // Close the workbook in the finally block to ensure it's always closed
            if (workbook != null) {
                try {
                    workbook.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    // Create headers in the Excel file based on a given set of titles
    private void createHeaders(Sheet sheet, String[][] fields) {
        var columnCounter = 0;
        for (int i=0; i<fields.length; i++) {
            createHeaderRow(sheet, Integer.parseInt(fields[i][0]), columnCounter, fields[i]);
            columnCounter = (columnCounter + (fields[i].length-2)); // fields[i].length-2 because the first 2 positions are not titles
        }
    }

    // Create a row header
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
                        List<ObjectNode> valuesSubtitles = ManageApiData.getValuesSubtitles(fields[i][1], linkedinInfo);
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

    // Writes the main titles values. Returns the last written row. 
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

    // Writes the sub titles values. Returns the last written row
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
                String fieldValue = "";
                if (valueSubtitles != null) {
                    fieldValue = valueSubtitles.get(fieldName).asText();
                }
                Cell cell = rowExperience.createCell(columnIndex + (i-2)); // i-2 because I want to start on the write length of the fields before
                cell.setCellValue(fieldValue);
            }
            lastWrittenRow++;
        }
        return lastWrittenRow;
    }

    // Gets the alumnis per year start/year conclusion in FEUP
    // Because one student is able to perform more than one course in FEUP, only the first one is considered
    private HashMap<String, List<Alumni>> alumnisPerYearMap() {
        HashMap<String, List<Alumni>> alumniMap = new HashMap<>();
        Iterator<Alumni> alumniIterator = alumniRepository.findAll().iterator();
        while (alumniIterator.hasNext()) {
            Alumni alumni = alumniIterator.next();

            // Gets the values of the education field
            String linkedinInfo = alumni.getLinkedinInfo();
            List<ObjectNode> valuesEducation = ManageApiData.getValuesSubtitles("education", linkedinInfo);

            String holdestYearStartStore = ""; // Stores the year start and year end of the first inscription in feup
            for (var education : valuesEducation) {
                if (CleanData.isValidSchool(education.get("school").asText())) {
                    String time = education.get("time").asText();
                    String[] datesStartEnd = time.split("-");
                    String[] dateStartDayMonthYear = datesStartEnd[0].trim().split("/");
                    String yearStart = dateStartDayMonthYear[2];
                    if (yearStart.equals("null")) { // User invalid
                        holdestYearStartStore = "INVALID";
                    } else { // Stores the time
                        holdestYearStartStore = yearStart;
                    }

                    break;// The first valid school to be found is the oldest one in terms of start so it's safe to excape without checking the others
                } 
            }

            // If no valid school was found ("") or if an invalid year start was found ("INVALID")
            if (holdestYearStartStore == "") { 
                // Increments the number of alumnis with invalid schools so it can later be printed
                String fullName = FilesHandler.extractFieldFromJson("full_name", linkedinInfo);
                System.out.println("!!! Invalid Alumnis because of school being invalid. Alumni: " +  fullName + " !!!");
                invalidAlumnisSchoolCount++;                
            } else if (holdestYearStartStore =="INVALID") {
                // Increments the number of alumnis with invalid start years so it can later be printed
                String fullName = FilesHandler.extractFieldFromJson("full_name", linkedinInfo);
                System.out.println("--- Invalid Alumnis because of year start being invalid. Alumni: " +  fullName + " ---");
                invalidAlumnisYearStartCount++;
            } else {
                // Stores in the HashMap the variable with the year and adds the alumni to the array if the key already exists
                // Gets the list of alumnis of the current year 
                List<Alumni> alumniList = alumniMap.getOrDefault(holdestYearStartStore, new ArrayList<>());
                alumniList.add(alumni);
                alumniMap.put(holdestYearStartStore, alumniList);
            }

            countAlumnisLinkedinLinks++;
        }
        return alumniMap;
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

    // Verify if the linkedin link was considered previously matched
    private boolean linkedinLinkConisderedPrevMatched (ArrayList<String> linksMultipleMatched, String foundLinkedinLink) {
        for (String linkMultipleMatched : linksMultipleMatched) {
            if (linkMultipleMatched.equals(foundLinkedinLink)) {
                return true;
            }
        } 
        return false;
    } 
}
