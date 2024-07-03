package com.feupAlumni.alumniFEUP.service.StrategyPattern_Clean;

import com.feupAlumni.alumniFEUP.service.AlumniEicHasCoursesService;
import com.feupAlumni.alumniFEUP.service.AlumniEicService;
import com.feupAlumni.alumniFEUP.service.AlumniService;
import com.feupAlumni.alumniFEUP.service.CityService;
import com.feupAlumni.alumniFEUP.service.CountryService;
import com.feupAlumni.alumniFEUP.service.CourseService;

public class AddAlumnusStrategy implements CleanTablesStrategy {
    
    @Override
    public void cleanTables(AlumniService alumniService, AlumniEicService alumniEicService, CourseService coursesService, AlumniEicHasCoursesService  alumniEic_has_coursesService, CityService cityService, CountryService countryService) {
        alumniEicService.celanAlumniEicTable(); // Alumni_EIC table, has to be deleted first because it has a foregin key from cities and countries  
        coursesService.cleanCourseTable(); // Couse table
        alumniEic_has_coursesService.cleanAlumniEicHasCourseTable(); // AlumniEIC_has_course table
        cityService.cleanCityTable(); // City
        countryService.cleanCountryTable(); // Country  
    }

}
