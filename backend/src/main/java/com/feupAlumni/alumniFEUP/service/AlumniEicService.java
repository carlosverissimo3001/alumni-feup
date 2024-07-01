package com.feupAlumni.alumniFEUP.service;

import java.io.File;
import java.util.List;
import java.util.Map;

import com.feupAlumni.alumniFEUP.model.AlumniEic;
import com.feupAlumni.alumniFEUP.model.LocationAlumnis;

public interface AlumniEicService {
    // Populates the AlumniEic table
    public void populateAlumniEicTable();

    // Creates a GeoJson file based on the AlumniEic information
    public void generateGeoJsonAlumniEic(File locationGeoJSON, String courseFilter, List<String> yearFilter, String geoJsonType);

    // Groups alumnis based on countries or cities
    public Map<LocationAlumnis, List<AlumniEic>> groupAlumnis(String geoJsonType);

    // Associates each alumni to a course and the respective year of conclusion
    public Map<String, Map<String, String>> alumniByCourseYearConclusion(String courseFilter, List<String> yearFilter);

    // Associates each alumni to a LinkedIn link
    public Map<String, String> alumniLinkedInLink(String courseFilter, List<String> yearFilter);

    // Saves the AlumniEic in the table
    public void savesAlumniEic(AlumniEic alumniEic);

    // Returns all AlumniEic in the table
    public List<AlumniEic> getAllAlumniEic();

    // Cleans data from the AlumniEic table
    public void celanAlumniEicTable();

}

