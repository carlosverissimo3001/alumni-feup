package com.feupAlumni.alumniFEUP.handlers;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class AlumniInfo {

    // Calls on the API which scrapes the user linkedin's profile
    public static HttpResponse<String> getLinkedinProfileInfo(String linkedinLink) throws IOException, InterruptedException {
        String apiEndpoint = "https://nubela.co/proxycurl/api/v2/linkedin";
        String apiKey = "XrgxC2i2_6ac2rHrjj9GjQ";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiEndpoint + "?twitter_profile_url=&facebook_profile_url&linkedin_profile_url=" + linkedinLink))
                .headers("Authorization", "Bearer " + apiKey)
                .build();

        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

}
