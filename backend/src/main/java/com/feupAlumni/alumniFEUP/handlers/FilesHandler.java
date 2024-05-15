package com.feupAlumni.alumniFEUP.handlers;

import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;

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
}
