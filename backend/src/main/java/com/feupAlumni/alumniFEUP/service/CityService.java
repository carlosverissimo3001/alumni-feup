package com.feupAlumni.alumniFEUP.service;

import java.util.List;

public interface CityService {
    // Populates the table with updated information. If the table has register, they are delted and the table is repopulated.
    public void populateCityTable();
    
    // Generates the city geoJason file
    public void generateCityGeoJson(String courseFilter, List<String> yearFilter);
}