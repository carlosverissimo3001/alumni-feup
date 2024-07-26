package com.feupAlumni.alumniFEUP.service;

import java.io.IOException;
import java.util.List;

import com.feupAlumni.alumniFEUP.model.City;

public interface CityService {
    // Populates the table with updated information
    public void populateCityTable(List<String> errorMessages) throws IOException, InterruptedException;

    // Saves the city in the city table
    public void saveCity(City citySave);

    // Returns the city based on the received name
    public City findCityByName(String cityName);

    // Cleans City table
    public void cleanCityTable();
}