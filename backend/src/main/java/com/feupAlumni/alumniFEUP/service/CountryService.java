package com.feupAlumni.alumniFEUP.service;

import java.util.List;

import com.feupAlumni.alumniFEUP.model.Country;

public interface CountryService {
    // Populates the table with updated information. If the table has register, they are delted and the table is repopulated.
    public void populateCountryTable();
    // Returns the information in the table
    public List<Country> getViewAlumniCountry();
}
