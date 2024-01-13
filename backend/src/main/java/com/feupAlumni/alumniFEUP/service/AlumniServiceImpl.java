package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.io.BufferedReader;
import java.io.FileWriter;
import java.io.IOException;

@Service
public class AlumniServiceImpl implements AlumniService{

    @Autowired
    private AlumniRepository alumniRepository;

    // Calls on the API which scrapes the user linkedin's profile
    private HttpResponse<String> getLinkedinProfileInfo(String linkedinLink) throws IOException, InterruptedException{
        String apiEndpoint = "https://nubela.co/proxycurl/api/v2/linkedin";
        String apiKey = "XrgxC2i2_6ac2rHrjj9GjQ";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(apiEndpoint + "?twitter_profile_url=&facebook_profile_url&linkedin_profile_url=" + linkedinLink))
        .headers("Authorization", "Bearer " + apiKey)
        .build();

        HttpResponse<String> linkedinInfoResponse = client.send(request, HttpResponse.BodyHandlers.ofString());
        return linkedinInfoResponse;
    }

    // Stores the reulst in a file for personal backup
    private void storeResultInFile(String linkedinInfoResponse) {
        String filePath = "C:/Users/jenif/OneDrive/Área de Trabalho/BackUpCallAPI";

        try (FileWriter writer = new FileWriter(filePath, true)) {
            writer.write(linkedinInfoResponse);
            writer.write(System.lineSeparator()); // Add a new line for each entry
        } catch (IOException e) {
            System.out.println("Error storing result in file: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Processes the file, extracts LinkedIn links, and stores them in the database
    @Override
    public void processFile(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()){
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
            String linkedinLink;

            while ((linkedinLink = reader.readLine()) != null){
                if(linkedinLink.length() != 0){

                    // !! Comented to make sure I don't call this method my accident !! This because I don't want to me making accidental calls to the API or accidentaly changing the backup file I have

                    /*// Call the API that gets the information of a linkedin profile
                    var linkedinInfoResponse = getLinkedinProfileInfo(linkedinLink);
                    System.out.println("STATUS CODE: " + linkedinInfoResponse.statusCode());

                    if(linkedinInfoResponse.statusCode() == 200){
                        // Stores the result in a file for personal backup
                        storeResultInFile(linkedinInfoResponse.body());

                         // Creates the alimni object with the constructor that needs the linkedinLink and the linkedinInfo
                        Alumni alumni = new Alumni(linkedinLink, linkedinInfoResponse.body());

                        // Stores the information in the database
                        alumniRepository.save(alumni);
                    }
                    else {
                        System.out.println("API call failed with status code: " + linkedinInfoResponse.statusCode() + linkedinInfoResponse.body() + " For profile: " + linkedinLink);
                    }*/
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error processing file", e);
        }
    }

    @Override
    public List<Alumni> getAllAlumnis() {
        return alumniRepository.findAll();
    }
}
