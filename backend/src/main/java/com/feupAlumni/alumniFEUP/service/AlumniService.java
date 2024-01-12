package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.model.Alumni;

import java.util.List;

public interface AlumniService {
    public Alumni saveAlumni(Alumni alumni);
    public List<Alumni> getAllAlumnis();
}
