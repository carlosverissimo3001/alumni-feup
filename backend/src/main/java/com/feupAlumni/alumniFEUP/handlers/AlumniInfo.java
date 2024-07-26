package com.feupAlumni.alumniFEUP.handlers;

import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Path;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.List;

public class AlumniInfo {

    // Download an image URL to the given path 
    public static String downloadAndSaveImage(String profilePicUrl, String pathStoreImage, String publicIdentifier, List<String> errorMessages) {
        try {
            URL url = new URL(profilePicUrl);
            Path targetPath = Path.of(pathStoreImage + "/" + publicIdentifier + ".png");
            
            try (InputStream in = url.openStream()) {
                Files.copy(in, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }
            return targetPath.toString();
        } catch (Exception e) {
            errorMessages.add("Failed to download or save image: " + e.getMessage());
            return null;
        }
    }

    // Calls on the API which scrapes the user linkedin's profile
    public static HttpResponse<String> getLinkedinProfileInfo(String linkedinLink, String apiKeyEncrypted) throws Exception {
        String apiEndpoint = JsonFileHandler.getPropertyFromApplicationProperties("apiLinkedin.endpoint").trim();
        String symmetricKey = JsonFileHandler.getPropertyFromApplicationProperties("encryption.key").trim();
        String apiKeyDecrypted = EncryptionHandler.decrypt(apiKeyEncrypted, symmetricKey);
        
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiEndpoint + "?twitter_profile_url=&facebook_profile_url&linkedin_profile_url=" + linkedinLink))
                .headers("Authorization", "Bearer " + apiKeyDecrypted)
                .build();

        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

}
