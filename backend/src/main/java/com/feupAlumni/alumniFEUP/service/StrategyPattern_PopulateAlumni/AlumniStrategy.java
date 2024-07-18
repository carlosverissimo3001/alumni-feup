package com.feupAlumni.alumniFEUP.service.StrategyPattern_PopulateAlumni;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

public interface AlumniStrategy {
    void populateAlumniTable(MultipartFile file) throws IOException, InterruptedException;
}
