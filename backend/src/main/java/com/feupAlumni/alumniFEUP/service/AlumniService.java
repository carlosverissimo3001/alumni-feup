package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.model.Alumni;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface AlumniService {
    public void processFile(MultipartFile file);
    public List<Alumni> getAllAlumnis();
}
