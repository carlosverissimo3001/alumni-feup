package com.feupAlumni.alumniFEUP.service;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.service.StrategyPattern_Clean.CleanTablesStrategy;
import com.feupAlumni.alumniFEUP.service.StrategyPattern_PopulateAlumni.AlumniStrategy;

@Service
public class DataPopulationServiceImpl implements DataPopulationService{

    @Autowired
    private AlumniService alumniService;
    @Autowired
    private CourseService courseService;
    @Autowired
    private CountryService countryService;
    @Autowired
    private CityService cityService;
    @Autowired
    private AlumniEicService alumniEicService;
    @Autowired
    private AlumniEicHasCoursesService alumniEic_has_coursesService;
    
    @Override
    public void populateTables(MultipartFile file, AlumniStrategy strategy) throws IOException, InterruptedException {
        // Populates the Alumni table with the API information
        alumniService.populateAlumniTable(file, strategy);
        // Country and city need to be first populated since alumni_eic has a foregin key.
        // AlumniEic and courses need to be populated before AlumniEIC_HAS_COURSE since this middle table has a foregin key of each of these tables
        cityService.populateCityTable();
        countryService.populateCountryTable();
        courseService.populateCoursesTable(file);
        alumniEicService.populateAlumniEicTable();
        alumniEic_has_coursesService.populateAlumniEicHasCoursesTable(file);
    }

    @Override
    public void cleanTables(CleanTablesStrategy strategy) {
        strategy.cleanTables(alumniService, alumniEicService, courseService, alumniEic_has_coursesService , cityService, countryService);
    }
}