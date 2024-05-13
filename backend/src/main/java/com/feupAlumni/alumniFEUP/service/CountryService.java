package com.feupAlumni.alumniFEUP.service;

import java.util.List;

public interface CountryService {
    // Populates the table with updated information. If the table has register, they are delted and the table is repopulated.
    public void populateCountryTable();

    // Generates the country geoJason file
    public void generateCountryGeoJson(String courseFilter, List<String> yearFilter);
}
