package com.feupAlumni.alumniFEUP.handlers;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.feupAlumni.alumniFEUP.model.AlumniEic;
import com.feupAlumni.alumniFEUP.model.GeoJSONFeature;
import com.feupAlumni.alumniFEUP.model.GeoJSONGeometry;
import com.feupAlumni.alumniFEUP.model.GeoJSONProperties;
import com.feupAlumni.alumniFEUP.model.GeoJSONStructure;
import com.feupAlumni.alumniFEUP.model.LocationAlumnis;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class JsonFileHandler {
    
    // It receives the coordinates in the form of a string like: "[latitude, longitude]"
    // and returns them as an array like: [longitude, latitude]
    private static List<Double> coordinatesToList(String coordinates) throws JsonMappingException, JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();

        JsonNode latlngNode = objectMapper.readTree(coordinates);

        List<Double> latlngList = new ArrayList<>();
        for(int i = latlngNode.size()-1; i>=0;i--){
            JsonNode element = latlngNode.get(i);
            latlngList.add(element.asDouble());
        }
        return latlngList;
    }

    // Creates a GeoJSON file
    private static void createEmptyGeoJSONFile(File file) {
        GeoJSONStructure emptyStructure = new GeoJSONStructure();
        try (FileWriter fileWriter = new FileWriter(file, false)) { // false allows overrides
            new GsonBuilder().setPrettyPrinting().create().toJson(emptyStructure, fileWriter);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // Writes the information in the GeoJson file
    private static void addLocationGeoJson(LocationAlumnis location, Map<String, String> alumniLinkedinLinkForLocation, Map<String, Map<String, String>> alumniByCourseYearConclusionForLocation, File fileGeoJson, Gson gson){
        try (FileReader fileReader = new FileReader(fileGeoJson, StandardCharsets.UTF_8)) {
            GeoJSONStructure geoJSONStructure = gson.fromJson(fileReader, GeoJSONStructure.class);

            GeoJSONFeature feature = new GeoJSONFeature();
            feature.setType("Feature");

            GeoJSONProperties properties = new GeoJSONProperties();
            properties.setName(Arrays.asList(location.getName()));
            properties.setStudents(alumniLinkedinLinkForLocation.size());

            // Collect alumni names and linkedin links for this location
            properties.setListLinkedinLinks(alumniLinkedinLinkForLocation);

            // Collect alumni names and courses (and respective year of conclusion) for this location
            properties.setCoursesYearConclusionByUser(alumniByCourseYearConclusionForLocation);

            feature.setProperties(properties);

            GeoJSONGeometry geometry = new GeoJSONGeometry();
            geometry.setType("Point");
            List<Double> coordinatesList = coordinatesToList(location.getCoordinates());
            geometry.setCoordinates(coordinatesList);

            feature.setGeometry(geometry);

            geoJSONStructure.setFeatures(feature);

            // Write the updated GeoJSON structure back to the file
            try (FileWriter fileWriter = new FileWriter(fileGeoJson, StandardCharsets.UTF_8)) {
                gson.toJson(geoJSONStructure, fileWriter);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

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

    // Creates tge geoJson file on the received parameters: country or city // course // year conclusion
    public static Map<File, Gson> createFile(File locationGeoJSON) {
        Map<File, Gson> fileGeoJson = new HashMap<>();        
        Gson gson = new GsonBuilder().setPrettyPrinting().create(); 
        createEmptyGeoJSONFile(locationGeoJSON);
        System.out.println("GeoJSON file created");
        fileGeoJson.put(locationGeoJSON, gson);
        return fileGeoJson;
    } 

    // Clens the geoJson files previously generated
    public static void cleanGeoJsonFiles(String directoryPath) throws IOException {
        try {
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
                System.out.println("Directory not found: " + directoryPath);
            }
        } catch (Error e) {
            System.out.println("Something wen wrong while trying to delete geoJsonFiles: " + e);
        }
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
                    addLocationGeoJson(location, alumniLinkedinLinkForLocation, alumniByCourseYearConclusionForLocation, fileGsonIteration.getKey(), fileGsonIteration.getValue());
                }
            }
        });
    }

}
