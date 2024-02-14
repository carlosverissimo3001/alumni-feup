package com.feupAlumni.alumniFEUP.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.handlers.FilesHandler;
import com.feupAlumni.alumniFEUP.handlers.ManageApiData;
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

}
