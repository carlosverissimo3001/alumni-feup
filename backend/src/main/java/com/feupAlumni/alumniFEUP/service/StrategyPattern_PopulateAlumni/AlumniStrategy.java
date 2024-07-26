package com.feupAlumni.alumniFEUP.service.StrategyPattern_PopulateAlumni;

import java.io.IOException;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface AlumniStrategy {
    void populateAlumniTable(MultipartFile file, List<String> errorMessages) throws IOException, InterruptedException;
}
