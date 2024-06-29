package com.feupAlumni.alumniFEUP.service;
import java.io.File;
import java.util.List;

public interface LocationService {
    // Generates the geoJson file
    public void generateGeoJson(File locationGeoJSON, String courseFilter, List<String> yearFilter, String geoJsonType);
}

