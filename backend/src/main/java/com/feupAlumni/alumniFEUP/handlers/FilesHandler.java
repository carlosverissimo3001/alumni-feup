package com.feupAlumni.alumniFEUP.handlers;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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
    public static String extractFieldFromJson(String fieldToExtract, String jsonData) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonData);
            return jsonNode.get(fieldToExtract).asText();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
    
}
