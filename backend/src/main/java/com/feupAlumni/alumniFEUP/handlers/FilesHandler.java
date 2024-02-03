package com.feupAlumni.alumniFEUP.handlers;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class FilesHandler {
    
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

    // If the file exists => delete 
    public static void fileDeletion(File file) {
        if(file.exists()){
            if (file.delete()) {
                System.out.println("Deleted existing file.");
            } else {
                System.err.println("Failed to delete existing file.");
            }
        }
    } 

    // Extracts the value of a given field in the Json file
    public static String extractFieldFromJson(String fieldToExtract, String jsonData, String nestedFrom) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonData);
            return extractField(jsonNode, fieldToExtract, nestedFrom);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
    
    private static String extractField(JsonNode jsonNode, String fieldToExtract, String nestedFrom) {
        JsonNode fieldNode = jsonNode.get(fieldToExtract);

        if (fieldNode != null) {
            return fieldNode.asText();
        } else {
            // Handle nested structures
            JsonNode nestedNode = jsonNode.get(nestedFrom);
            if (nestedNode != null && nestedNode.isArray()) {
                String schools = "";
                for (JsonNode nestedEntry : nestedNode) {
                    String result = extractField(nestedEntry, fieldToExtract, nestedFrom);
                    if (result != null) {
                        schools += " --- " + result;
                    }
                }
                return schools;
            } else if (nestedNode != null) {
                return extractField(nestedNode, fieldToExtract, null);
            }
            return null;
        }
    }

    // Returns the fields of the education field
    public static JsonNode getAlumniEducationDetailsOfFeup(String jsonData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(jsonData);

            JsonNode educationNode = jsonNode.get("education");
            if (educationNode != null && educationNode.isArray()) {
                for (JsonNode entry : educationNode) {
                    String schoolName = extractField(entry, "school", null);
                    if (isValidSchool(schoolName)) {
                        String degreeName = extractField(entry, "degree_name", null);
                        String fieldOfStudy = extractField(entry, "field_of_study", null);
                        String yearStart = extractField(entry, "year", "starts_at");
                        String yearEnd = extractField(entry, "year", "ends_at");

                        if (degreeName != null && fieldOfStudy != null) {
                            ObjectNode resultNode = objectMapper.createObjectNode();
                            resultNode.put("schoolName", schoolName);
                            resultNode.put("degreeName", degreeName);
                            resultNode.put("fieldOfStudy", fieldOfStudy);
                            resultNode.put("yearStart", yearStart);
                            resultNode.put("yearEnd", yearEnd);
                            
                            return resultNode;
                        }
                    }
                }
            }
            return null;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }


    public static boolean isValidSchool(String schoolName) {
        // Convert school name to lowercase for case-insensitive comparison
        String lowerCaseSchool = schoolName.toLowerCase();
    
        // Check if the school name matches any of the specified values
        return lowerCaseSchool.contains("faculdade de engenharia da universidade do porto") ||
               lowerCaseSchool.contains("feup") ||
               lowerCaseSchool.contains("faculty engineering university of porto") ||
               lowerCaseSchool.contains("universidade do porto") ||
               lowerCaseSchool.contains("university of porto") ||
               lowerCaseSchool.contains("faculdade de engenharia do porto");
    }
}
