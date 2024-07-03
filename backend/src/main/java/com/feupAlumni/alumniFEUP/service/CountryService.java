package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.model.Country;

public interface CountryService {
    // Populates the table with updated information.
    public void populateCountryTable();

    // Saves the country in the Table
    public void saveCountry(Country country);

    // Returns a country based on a received name
    public Country getCountryByName(String countryName);

    // Cleans country table
    public void cleanCountryTable();

}
