package com.feupAlumni.alumniFEUP.handlers;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.feupAlumni.alumniFEUP.model.Alumni;

import org.apache.poi.ss.usermodel.*;

public class ExcelFilesHandler {
    
    // Create a row header
    private static void createHeaderRow (Sheet sheet, int rowIndex, int startColumn, String[] titles) {
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

    // Writes the main titles values. Returns the last written row. 
    private static int writeFieldMainTitleContent (Alumni alumni, Sheet sheet, int rowIndex, int columnIndex, String[] titles, String linkedinInfo) {
        int lastWrittenRow = rowIndex;       
        // Create a new row
        Row row = sheet.getRow(rowIndex); 
        if (row == null) {
            row = sheet.createRow(rowIndex);
        }
        for (int i=2; i<titles.length; i++) {
            if (titles[i] != "Linkedin Link") {
                String fieldValue = JsonFileHandler.extractFieldFromJson(titles[i], linkedinInfo);
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
    private static int writeFieldSubtitleContent (Sheet sheet, List<ObjectNode> valuesSubtitles, String[] titles, int columnIndex, int rowIndex) {
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

    // Goes through the Excel file and returns the row in which the linkedin link is in 
    public static Map<String, Row> excelLinkedinLinksToRows(MultipartFile file) {
        Map<String, Row> excelLinkedinMap = new HashMap<>();

        try (InputStream inputStream = file.getInputStream()) {
            Workbook workbook = WorkbookFactory.create(inputStream);
            Sheet sheet = workbook.getSheetAt(1); // Second sheet
            Iterator<Row> rowIterator = sheet.iterator();

            // Skip the first two rows
            for (int i = 0; i < 2; i++) {
                if (rowIterator.hasNext()) {
                    rowIterator.next();
                }
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                String linkedinLink = row.getCell(4).getStringCellValue();
                if (!linkedinLink.isEmpty()) {
                    excelLinkedinMap.put(linkedinLink, row);
                }
            }
            return excelLinkedinMap;
        } catch (Exception  e) {
            System.out.println("Error !!!!: " + e);
            return null;
        }
    }

    // Create headers in the Excel file based on a given set of titles
    public static void createHeaders(Sheet sheet, String[][] fields) {
        var columnCounter = 0;
        for (int i=0; i<fields.length; i++) {
            createHeaderRow(sheet, Integer.parseInt(fields[i][0]), columnCounter, fields[i]);
            columnCounter = (columnCounter + (fields[i].length-2)); // fields[i].length-2 because the first 2 positions are not titles
        }
    }

    // Writes the alumni data to the row
    public static int writeAlumniDataToRow (Alumni alumni, int rowIndex, String linkedinInfo, Sheet sheet, String[][] fields) {
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

}
