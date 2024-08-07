package com.feupAlumni.alumniFEUP.service.StrategyPattern_Clean;

import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.service.AlumniEicHasCoursesService;
import com.feupAlumni.alumniFEUP.service.AlumniEicService;
import com.feupAlumni.alumniFEUP.service.AlumniService;
import com.feupAlumni.alumniFEUP.service.CityService;
import com.feupAlumni.alumniFEUP.service.CountryService;
import com.feupAlumni.alumniFEUP.service.CourseService;

public class ReplaceAlumnusStrategy implements CleanTablesStrategy {
    
    @Override
    public void cleanTables(MultipartFile file, AlumniService alumniService, AlumniEicService alumniEicService, CourseService coursesService, AlumniEicHasCoursesService  alumniEic_has_coursesService, CityService cityService, CountryService countryService) {
        alumniService.cleanAlumniTable(); // Alumni table  
        alumniEicService.celanAlumniEicTable(); // Alumni_EIC table, has to be deleted first because it has a foregin key from cities and countries  
        coursesService.cleanCourseTable(); // Couse table
        alumniEic_has_coursesService.cleanAlumniEicHasCourseTable(); // AlumniEIC_has_course table
        cityService.cleanCityTable(); // City
        countryService.cleanCountryTable(); // Country  
    }
}
