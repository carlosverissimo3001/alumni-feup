package com.feupAlumni.alumniFEUP.service;
import java.util.List;

public interface LocationService {
    // Generates the geoJson file
    public void generateGeoJson(String courseFilter, List<String> yearFilter, String geoJsonType);
}

