package com.feupAlumni.alumniFEUP.handlers;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpClient.Version;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URLEncoder;

public class Location {

    

    // Calls on the API which gets the information about a given country (inlcuding their latitude and longitude)
    private static JsonNode getCoordinatesForCountry (String countryCode) throws IOException, InterruptedException {
            
        String API_URL = "http://api.geonames.org/searchJSON";
        String USERNAME = "jenifer12345";
        String url = String.format("%s?country=%s&maxRows=1&username=%s", API_URL, countryCode, USERNAME);

        HttpClient httpClient = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).version(Version.HTTP_1_1).build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if(response.statusCode() == 200){
                ObjectMapper objectMapper = new ObjectMapper();
                return objectMapper.readTree(response.body());
            } else {
                System.out.println("Failed to get coordinates for country code: " + countryCode);
                return null;
            }
        } catch (Exception e) {
            System.out.println("ERRO");
            e.printStackTrace();
            return null;
        }
        
    }

    // Calls on the API which gets the information about a given city (including their latitude and longitude)
    private static JsonNode getCoordinatesForCity(String city, String country) throws IOException, InterruptedException {
        String username = "jenifer12345";
        String encodedCityName = URLEncoder.encode(city, "UTF-8");
        String apiUrl = "http://api.geonames.org/searchJSON?q=" + encodedCityName + "&country=" + country + "&maxRows=1&username=" + username;

        // Create an HTTP connection
        URL url = new URL(apiUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        
        // Get the response
        BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        StringBuilder response = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null){
            response.append(line);
        }
        reader.close();

        // Parse the JSON response to extract latitude and longitude
        ObjectMapper objectMapper = new ObjectMapper();
        connection.disconnect();
        return objectMapper.readTree(response.toString());
    }

    // Gets the coordinates of a given country
    public static String getCountryCoordinates(String countryCode) throws IOException, InterruptedException{
        JsonNode jsonResponse = getCoordinatesForCountry(countryCode);

        JsonNode geonamesArray = jsonResponse.path("geonames");
        if (geonamesArray.isArray() && geonamesArray.size() > 0) {
            JsonNode firstElement = geonamesArray.get(0);

            JsonNode latitude = firstElement.path("lat");
            JsonNode longitude = firstElement.path("lng");

            return "[" + latitude + "," + longitude +"]";
        } else {
            System.out.println("No geonames data found for the country code: " + countryCode);
            return null;
        }
    }

    // Gets the coordinates of a given city
    public static String getCityCoordinates(String city, String country) throws IOException, InterruptedException {
        JsonNode jsonResponse = getCoordinatesForCity(city, country);

        JsonNode geonamesNode = jsonResponse.path("geonames");
        JsonNode firstResultNode = geonamesNode.get(0);
        if (firstResultNode != null) {
            double latitude = firstResultNode.get("lat").asDouble();
            double longitude = firstResultNode.get("lng").asDouble();
            return "[" + latitude + "," + longitude + "]";
        } else {
            System.out.println("Coordinates API was not able to find coordinates for city: " + city + " country: " + country + " firstResultNode: " + firstResultNode);
        }
        
        return null;        
    }

}
