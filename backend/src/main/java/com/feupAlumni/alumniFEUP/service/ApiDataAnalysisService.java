package com.feupAlumni.alumniFEUP.service;

import org.springframework.web.multipart.MultipartFile;

public interface ApiDataAnalysisService {
    
    // Reads the Alumni table and stores the information in an excel file
    public byte[] alumniTableToExcel(MultipartFile file);
}
