package com.feupAlumni.alumniFEUP.handlers;

import java.io.IOException;
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

    // Validates First column of values: they all should be a 9 digit number and can't be empty
    // Validate the value of the first column (0) of the current row
    private static void validateFirstColumnValueOfCurrentRow (Cell cell, List<String> errorMessages, int rowIndex, int colIndex) {
        Double cellValueScientificNotation = cell.getNumericCellValue();
        String cellValue = String.format("%.0f", cellValueScientificNotation); // Without Scientific Notation
        if (!(cellValue.length() == 9)) {
            String messageError = "Row: " + (rowIndex+1) + " Column: " + (colIndex+1) + " should have 9 digits and it has: " + String.valueOf(cellValue).length() + " cellValue: " + cellValue;
            errorMessages.add(messageError);
            System.out.println("!! messageError: " + messageError);
        }
    }

    // Validates if the cell content is a string or formula: they need to be a string and can't be empty
    private static void validateCellStringFromula (Cell cell, List<String> errorMessages, int rowIndex, int colIndex) {
        if (cell == null) {
            String messageError = "Row: " + (rowIndex+1) + " Column: " + (colIndex+1) + " should of type string and have a value but it's currently null.";
            errorMessages.add(messageError);
            System.out.println("!! messageError: " + messageError);
        } else  {
            if (!(cell.getCellType() == CellType.FORMULA) && !(cell.getCellType() == CellType.STRING)) {
                String messageError = "Row: " + (rowIndex+1) + " Column: " + (colIndex+1) + " should of type Formula";
                errorMessages.add(messageError);
                System.out.println("!! messageError: " + messageError);
            }
        }
    }

    // Validates valid LinkedIn Link: they shoudl start with https://www.linkedin.com/in/ and end with '/' and can't be empty
    private static void validateValidLinkedInLink (Cell cell, List<String> errorMessages, int rowIndex, int colIndex) {
        try {
            if (cell.getCellType() == CellType.FORMULA || cell.getCellType() == CellType.STRING) {
                String cellValue = cell.getStringCellValue();
                if (cellValue == null || cellValue.isEmpty()) {
                    String messageError = "Row " + (rowIndex+1) + " Column " + (colIndex+1) + " should not be empty.";
                    errorMessages.add(messageError);
                    System.out.println("!! messageError: " + messageError);
                    return;
                }
                String urlPrefix = JsonFileHandler.getPropertyFromApplicationProperties("excel.linkedinPerfix").trim();
                if (!cellValue.startsWith(urlPrefix)) {
                    String messageError = "Row " + (rowIndex+1) + " Column " + (colIndex+1) + " should start with '" + urlPrefix + "'.";
                    errorMessages.add(messageError);
                    System.out.println("!! messageError: " + messageError);
                }
                if (!cellValue.endsWith("/")) {
                    String messageError = "Row " + (rowIndex+1) + " Column " + (colIndex+1) + " should end with '/'."; 
                    errorMessages.add("Row " + (rowIndex+1) + " Column " + (colIndex+1) + " should end with '/'.");
                    System.out.println("!! messageError: " + messageError);
                }
            } else {
                String messageError = "Row " + (rowIndex+1) + " Column " + (colIndex+1) + " should be of type Formula and is from type: " + cell.getCellType();
                errorMessages.add(messageError);
                System.out.println("!! messageError: " + messageError);
            }
        } catch (Exception e) {
            String messageError = "Row " + (rowIndex+1) + " Column " + (colIndex+1) + " is not a string corresponding to a linkedin link.";
            errorMessages.add(messageError);
            System.out.println("!! messageError: " + messageError);
        }
        
    }

    // Validates the Forth column of values: should be MIEIC, L.EIC, M.EIC, MEI, LEIC and should have the following year xxxx/yyyy
    //                                       should have the structure {course} / {lective year}
    // Validate the value of the forth column (3) of the current row
    private static void validateForthColumnValueOfCurrentRow (Cell cell, List<String> errorMessages, int rowIndex, int colIndex) {
        List<String> courses = new ArrayList<>();
        List<String> years = new ArrayList<>();
        String cellValue = cell.getStringCellValue();

        // Trim the cell value to remove leading and trailing whitespace
        cellValue = cellValue.trim();
        
        // Split the cell value based on spaces
        String[] parts = cellValue.split("\\s+");
        for (String part : parts) {
            if (part.matches("\\d{4}/\\d{4}")) { // Check if the part is a year by using a regex to match a year pattern
                years.add(part);
            } else {
                courses.add(part); // If not a year, it's a course
            }
        }

        // Validate courses
        for (String course : courses) {
            if (!course.equals("MIEIC") && !course.equals("L.EIC") && !course.equals("M.EIC") && !course.equals("MEI") && !course.equals("LEIC")) {
                String messageError = "Row " + (rowIndex+1) + " Column " + (colIndex+1) + " has the value: '" + course + "' but it should be on of these: MIEIC, L.EIC, M.EIC, MEI, LEIC.";
                errorMessages.add(messageError);
                System.out.println("!! messageError: " + messageError);
            }
        }
        // Validate years structure
        for (String year : years) {
            String[] yearSplited = year.split("/");
            if (Integer.parseInt(yearSplited[0])+1 != Integer.parseInt(yearSplited[1])) {
                String messageError = "Row " + (rowIndex+1) + " Column " + (colIndex+1) + " has an invalid conclusion year: '" + yearSplited[0] + "' should be less by one falue from '" + yearSplited[1] + "'. The expected structure is e.g. 2022/2023.";
                errorMessages.add(messageError);
                System.out.println("!! messageError: " + messageError);
            }
        }
        if (courses.size()!=years.size()) {
            String messageError = "Row " + (rowIndex+1) + " Column " + (colIndex+1) + " has an invalid structure. It should have this structure e.g.: 'MIEIC 2016/2027 L.EIC 2022/2023' and it is: " + cellValue + ".";
            errorMessages.add(messageError);
            System.out.println("!! messageError: " + messageError);
        }
    }

    // validates the headers names: can't be empty and should be the same ones as the ones defined in the application.properties file.
    // If no errors are found it returns no error message.
    private static void validateHeadersExcelFile (List<String> headers, Row firstRow, List<String> errorMessages) {
        if (firstRow == null) {
            String messageError = "The first row should have the headers: ";
            for (String header : headers) {
                messageError += header + ", ";
            }
            messageError += " and it's currently empty. Ensure you have this information in the first sheet of your Excel file.";
            errorMessages.add(messageError);
            System.out.println("!! messageError: " + messageError);
            return;
        }

        // Iterates through all the headers which are in the first row and verifies if they have the currect name
        for (int i=0; i<headers.size(); i++) {
            Cell cell = firstRow.getCell(i);
            String valueCellNotNormalized = cell.getStringCellValue();
            String currentCellValue = valueCellNotNormalized;
            if (!currentCellValue.equals(headers.get(i))) {
                String messageError = "The cell nº: " + (i+1) + " of the first row should have the header: '" + headers.get(i) + "'' and is currently: '" + currentCellValue + "''. Ensure you have this information in the first sheet of your Excel file.";
                System.out.println("messageError: " + messageError);
                errorMessages.add(messageError);
                System.out.println("!! messageError: " + messageError);
            }
        }
        return;
    }

    // Validates the content of each heather in the Excel file
    private static void validateHeadersContent(Sheet sheet, List<String> errorMessages) {
        Integer columnNumber = Integer.parseInt(JsonFileHandler.getPropertyFromApplicationProperties("excel.columnNumber").trim());
        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) { // Iterates over every Excel row starting  on the second row, row nº1 (the first row are headers and were already validated)
            Row row = sheet.getRow(rowIndex);
            for (int colIndex = 0; colIndex < columnNumber; colIndex++) { // Iterates over the columns of the current row
                Cell cell = row.getCell(colIndex);
                switch (colIndex) {
                    case 0:
                        validateFirstColumnValueOfCurrentRow(cell, errorMessages, rowIndex, colIndex);
                        break;
                    case 1:
                        // Validate the value of the second column (1) of the current row
                        validateCellStringFromula(cell, errorMessages, rowIndex, colIndex);
                        break;
                    case 2:  
                        // Validate the value of the third column (2) of the current row
                        validateValidLinkedInLink(cell, errorMessages, rowIndex, colIndex);
                        break;
                    case 3:
                        validateForthColumnValueOfCurrentRow(cell, errorMessages, rowIndex, colIndex);
                        break;
                    default:
                        String messageError = "The excel file should have a maximum of 4 columns.";
                        errorMessages.add(messageError);
                        System.out.println("!! messageError: " + messageError);
                        break;
                }
            }
        }
    }

    private static void excelStandardValidations(MultipartFile file, List<String> errorMessages) {
        // Validates if a file has been received
        if (file == null) {
            String messageError = "No file received.";
            errorMessages.add(messageError);
            System.out.println("!! messageError: " + messageError);
        } 
        // Validates if the file is empty
        if (file.isEmpty()) {
            String messageError = "File is empty";
            errorMessages.add(messageError);
            System.out.println("!! messageError: " + messageError);
        } 
        // Validates if is an Excel file
        String fileName = file.getOriginalFilename();
        if (fileName == null || !(fileName.endsWith(".xls") || fileName.endsWith(".xlsx"))) {
            String messageError = "The file is not an Excel file. Please upload a file with .xls or .xlsx extension.";
            errorMessages.add(messageError);
            System.out.println("!! messageError: " + messageError);
        }
    }

    // Create a row header
    public static void createHeaderRow (Sheet sheet, int rowIndex, int startColumn, String[] titles) {
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

    // If there is any error with the Excel file structure adds to the erroMessages so they can be sent at once
    public static List<String> validateExcelFile(MultipartFile file) throws IOException {
        List<String> errorMessages = new ArrayList<>(); // Stores the errors
        excelStandardValidations(file, errorMessages);
        // Validates the Excel file content: goes through the Excel file 
        try (InputStream inputStream = file.getInputStream()) {
            Workbook workbook = WorkbookFactory.create(inputStream);
            Integer excelSheet = Integer.parseInt(JsonFileHandler.getPropertyFromApplicationProperties("excel.sheet").trim());
            Sheet sheet = workbook.getSheetAt(excelSheet); // Reeds from the sheet indicated in the application.properties

            // Validates Headers
            // Gets the headers of the Excel file defined on the application.properties 
            String firstHeader = JsonFileHandler.getPropertyFromApplicationProperties("excel.firstColumnName").trim();
            String secondHeader = JsonFileHandler.getPropertyFromApplicationProperties("excel.secondColumnName").trim();
            String thirdHeader = JsonFileHandler.getPropertyFromApplicationProperties("excel.thirdColumnName").trim();
            String forthHeader = JsonFileHandler.getPropertyFromApplicationProperties("excel.forthColumnName").trim();
            List<String> headers = new ArrayList<>();
            headers.add(firstHeader);
            headers.add(secondHeader);
            headers.add(thirdHeader);
            headers.add(forthHeader);
            Row firstRow = sheet.getRow(0); // first row    
            validateHeadersExcelFile(headers, firstRow, errorMessages);
            // Validates values of each Header. 
            validateHeadersContent(sheet, errorMessages);
        }
        return errorMessages;
    }

    // Goes through the Excel file and returns the row in which the linkedin link is in 
    public static Map<String, Row> excelLinkedinLinksToRows(MultipartFile file) {
        Map<String, Row> excelLinkedinMap = new HashMap<>();

        try (InputStream inputStream = file.getInputStream()) {
            Workbook workbook = WorkbookFactory.create(inputStream);
            int sheetReadFrom = Integer.parseInt(JsonFileHandler.getPropertyFromApplicationProperties("excel.sheet").trim());
            Sheet sheet = workbook.getSheetAt(sheetReadFrom); // Sheet to read from
            Iterator<Row> rowIterator = sheet.iterator();

            // Skip the first row which corresponds to headers
            for (int i = 0; i < 1; i++) {
                if (rowIterator.hasNext()) {
                    rowIterator.next();
                }
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                int cellForLinkedInLink = Integer.parseInt(JsonFileHandler.getPropertyFromApplicationProperties("excel.rowForLinkedInLink").trim());
                String linkedinLink = row.getCell(cellForLinkedInLink).getStringCellValue();
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
    public static int writeAPIResultToRow (Alumni alumni, int rowIndex, String linkedinInfo, Sheet sheet, String[][] fields) {
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
