package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.handlers.AlumniInfo;
import com.feupAlumni.alumniFEUP.handlers.FilesHandler;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.model.AlumniBackup;
import com.feupAlumni.alumniFEUP.repository.AlumniBackupRepository;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.io.BufferedReader;

@Service
public class AlumniServiceImpl implements AlumniService{

    @Autowired
    private AlumniRepository alumniRepository;
    @Autowired
    private AlumniBackupRepository alumniBackupRepository;

    @Override
    public void processFile(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()){
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
            String linkedinLink;

            while ((linkedinLink = reader.readLine()) != null){
                if(linkedinLink.length() != 0){
                    // Call the API that gets the information of a linkedin profile
                    var linkedinInfoResponse = AlumniInfo.getLinkedinProfileInfo(linkedinLink);

                    if(linkedinInfoResponse.statusCode() == 200){
                        // Stores the result in a file for personal backup
                        String filePath = "C:/Users/jenif/OneDrive/Área de Trabalho/BackUpCallAPI";
                        FilesHandler.storeInfoInFile(linkedinInfoResponse.body(), filePath);

                         // Creates the alumni object with the constructor that needs the linkedinLink and the linkedinInfo
                        Alumni alumni = new Alumni(linkedinLink, linkedinInfoResponse.body());

                        // Stores the information in the database
                        alumniRepository.save(alumni);
                    }
                    else {
                        System.out.println("API call failed with status code: " + linkedinInfoResponse.statusCode() + linkedinInfoResponse.body() + " For profile: " + linkedinLink);
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error processing file", e);
        }
    }

    @Override
    public void backupAlumnis() {

        // Check if AlumniBackup table is not empty
        if (alumniBackupRepository.count() > 0) {   
            System.err.println("Table AlumniBackup populated. Registers are going to be deteled!");
            alumniBackupRepository.deleteAll();
        }

        // Fetch all alumnis
        List<Alumni> alumnis = alumniRepository.findAll();

        // Iterate through alumnis and add them to alumnibackup table
        for (Alumni alumni : alumnis) {
            AlumniBackup alumniBackup = new AlumniBackup(alumni.getLinkedinLink(), alumni.getLinkedinInfo());
            alumniBackupRepository.save(alumniBackup);
        }
    }

    @Override
    public List<Alumni> getAllAlumnis() {
        return alumniRepository.findAll();
    }
}
