package com.feupAlumni.alumniFEUP.service;

import java.io.IOException;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.service.StrategyPattern_Clean.CleanTablesStrategy;
import com.feupAlumni.alumniFEUP.service.StrategyPattern_PopulateAlumni.AlumniStrategy;

public interface DataPopulationService {
    // Populates all tables
    public List<String> populateTables(MultipartFile file, AlumniStrategy strategy) throws IOException, InterruptedException;

    // Cleans Tables
    public void cleanTables(CleanTablesStrategy strategy);
}
