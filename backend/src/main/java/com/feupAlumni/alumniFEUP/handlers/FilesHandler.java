package com.feupAlumni.alumniFEUP.handlers;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.model.AlumniEic;
import com.feupAlumni.alumniFEUP.model.LocationAlumnis;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.apache.poi.ss.usermodel.*;

public class FilesHandler {
    
    // Determines the file name based on the filter inputs: geoJsonType(country/city), course, conclusion year
    public static String determineFileName(String geoJsonType, String course, List<String> conclusionYears) {
        var fileName = "";
        if (geoJsonType.equals("") && course.equals("") && conclusionYears.get(0).equals("") && conclusionYears.get(1).equals("")) {
            fileName = "emptyFileLocation.json";
        } else {
            fileName = geoJsonType + course + conclusionYears.get(0) + conclusionYears.get(1) + ".json";
        }
        return fileName;
    }

    // Stores infromation in a given file
    public static void storeInfoInFile(String information, String filePath) {
        try (FileWriter writer = new FileWriter(filePath, true)) {
            writer.write(information);
            writer.write(System.lineSeparator()); // Add a new line for each entry
        } catch (IOException e) {
            System.out.println("Error storing result in file: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Extracts the value of a given NOT nested field of a json
    public static String extractFieldFromJson(String fieldToExtract, String jsonData) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonData);
            JsonNode fieldNode = jsonNode.get(fieldToExtract);
            if (fieldNode != null) {
                if (fieldNode.isArray()) {
                    ArrayNode arrayNode = (ArrayNode) fieldNode;
                    List<String> values = new ArrayList<>();
                    for (JsonNode node : arrayNode) {
                        values.add(node.asText());
                    }
                    return String.join(", ", values); // Join array elements with a delimiter
                } else {
                    return fieldNode.asText(); // non array case
                }
            } else {
                return ""; // field doesn't exist
            }


        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
    
    // Extracts nested field unitl 1 level 
    public static String extractOneLevelNestedFiled(JsonNode jsonNode, String fieldToExtract, String nestedFrom) {
        JsonNode fieldNode = jsonNode.get(fieldToExtract);

        if (fieldNode != null) { 
            return fieldNode.asText();
        } else {
            // Handle nested structures untill 1 level
            JsonNode nestedNode = jsonNode.get(nestedFrom);
            if (nestedNode != null) {
                return extractOneLevelNestedFiled(nestedNode, fieldToExtract, null);
            }
            return null;
        }
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

    // Clens the geoJson files previously generated
    public static void cleanGeoJsonFiles(String directoryPath) throws IOException {
        Path dir = Paths.get(directoryPath);
        if (Files.exists(dir) && Files.isDirectory(dir)) {
            try (Stream<Path> files = Files.list(dir)) {
                files.forEach(file -> {
                    try {
                        Files.delete(file);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                });
            }
        } else {
            throw new IOException("Directory not found: " + directoryPath);
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

    // Creates tge geoJson file on the received parameters: country or city // course // year conclusion
    public static Map<File, Gson> createFile(File locationGeoJSON) {
        Map<File, Gson> fileGeoJson = new HashMap<>();        
        Gson gson = new GsonBuilder().setPrettyPrinting().create(); 
        Location.createEmptyGeoJSONFile(locationGeoJSON);
        System.out.println("GeoJSON file created");
        fileGeoJson.put(locationGeoJSON, gson);
        return fileGeoJson;
    } 

    // Writes the content in a geoJson
    public static void addContentInGeoJson(Map<LocationAlumnis, List<AlumniEic>> alumniByLocation, Map<String, String> alumniLinkedInLink, Map<String, Map<String, String>> alumniByCourseYearConclusion, Map<File, Gson> fileGson) {
        alumniByLocation.forEach((location, alumniList) -> {
            if (!location.getName().equals("null") && alumniList.size() > 0) { //doesn't write null locations
                // From the map of all alumnis associated with the respecitve linkedin link (alumniLinkedInLink)
                // it only extracts the the alumnis from the alumniList of the current location
                Map<String, String> alumniLinkedinLinkForLocation = alumniLinkedInLink.entrySet().stream()
                    .filter(entry -> alumniList.stream().anyMatch(alumni -> alumni.getLinkedinLink().equals(entry.getKey())))
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

                // From the map of all alumnis associated with the respective course and year of conclusion (alumniByCourseYearConclusion)
                // it only extracts the alumnis from the alumniList of the current location
                Map<String, Map<String, String>> alumniByCourseYearConclusionForLocation = alumniByCourseYearConclusion.entrySet().stream()
                .filter(entry -> alumniList.stream().anyMatch(alumni -> alumni.getLinkedinLink().equals(entry.getKey())))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

                if (alumniLinkedinLinkForLocation.size() > 0 && alumniByCourseYearConclusionForLocation.size() > 0) {
                    Map.Entry<File, Gson> fileGsonIteration = fileGson.entrySet().iterator().next();
                    Location.addLocationGeoJson(location, alumniLinkedinLinkForLocation, alumniByCourseYearConclusionForLocation, fileGsonIteration.getKey(), fileGsonIteration.getValue());
                }
            }
        });
    }
}
