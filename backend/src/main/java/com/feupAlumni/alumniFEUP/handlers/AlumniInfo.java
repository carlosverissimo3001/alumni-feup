package com.feupAlumni.alumniFEUP.handlers;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Path;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Properties;

public class AlumniInfo {

    // Gets the API Key from the files' configuration 
    private static String getApiKeyFromConfig() throws IOException {
        Properties properties = new Properties();
        try (InputStream input = AlumniInfo.class.getClassLoader().getResourceAsStream("application.properties")) {
            if (input == null) {
                System.out.println("Unable to find application.properties");
                return null;
            }
           
            properties.load(input);
    
            return properties.getProperty("linkedin.api.key");
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    // Download an image URL to the given path 
    public static String downloadAndSaveImage(String profilePicUrl, String pathStoreImage, String publicIdentifier) {
        try {
            URL url = new URL(profilePicUrl);
            Path targetPath = Path.of(pathStoreImage + "/" + publicIdentifier + ".png");
            System.out.println("targetPath: " + targetPath);
            try (InputStream in = url.openStream()) {
                Files.copy(in, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }
            return targetPath.toString();
        } catch (Exception e) {
            System.out.println("Failed to download or save image: " + e.getMessage());
            return null;
        }
    }

    // Calls on the API which scrapes the user linkedin's profile
    public static HttpResponse<String> getLinkedinProfileInfo(String linkedinLink) throws IOException, InterruptedException {
        String apiEndpoint = "https://nubela.co/proxycurl/api/v2/linkedin";
        String apiKey = getApiKeyFromConfig();

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiEndpoint + "?twitter_profile_url=&facebook_profile_url&linkedin_profile_url=" + linkedinLink))
                .headers("Authorization", "Bearer " + apiKey)
                .build();

        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

}
