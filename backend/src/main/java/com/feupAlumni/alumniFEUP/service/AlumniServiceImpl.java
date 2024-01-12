package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.model.Alumni;
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

    // Processes the file, extracts LinkedIn links, and stores them in the database
    @Override
    public void processFile(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()){
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
            String line;
            while ((line = reader.readLine()) != null){
                if(line.length() != 0){
                    Alumni alumni = new Alumni(line);
                    // Add logic to store the LinkedIn link in the database
                    alumniRepository.save(alumni);
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
