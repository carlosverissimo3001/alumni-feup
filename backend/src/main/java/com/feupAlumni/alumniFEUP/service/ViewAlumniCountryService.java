package com.feupAlumni.alumniFEUP.service;

import java.util.List;

import com.feupAlumni.alumniFEUP.model.ViewAlumniCountry;

public interface ViewAlumniCountryService {
    // Populates the table with updated information. If the table has register, they are delted and the table is repopulated.
    // Generates the GeoJSON file.
    public void setLocationSetup();
    // Returns the information in the table
    public List<ViewAlumniCountry> getViewAlumniCountry();
}
