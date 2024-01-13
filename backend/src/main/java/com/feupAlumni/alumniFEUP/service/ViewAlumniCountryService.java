package com.feupAlumni.alumniFEUP.service;

import java.util.List;

import com.feupAlumni.alumniFEUP.model.ViewAlumniCountry;

public interface ViewAlumniCountryService {
    // Populates the table with updated information
    public void setViewAlumniCountry();
    // Returns the information in the table
    public List<ViewAlumniCountry> getViewAlumniCountry();
}
