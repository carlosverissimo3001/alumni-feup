package com.feupAlumni.alumniFEUP.service.StrategyPattern_Clean;

import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.service.AlumniEicHasCoursesService;
import com.feupAlumni.alumniFEUP.service.AlumniEicService;
import com.feupAlumni.alumniFEUP.service.AlumniService;
import com.feupAlumni.alumniFEUP.service.CityService;
import com.feupAlumni.alumniFEUP.service.CountryService;
import com.feupAlumni.alumniFEUP.service.CourseService;

public class AddAlumnusStrategy implements CleanTablesStrategy {
    
    @Override
    public void cleanTables(MultipartFile file, AlumniService alumniService, AlumniEicService alumniEicService, CourseService coursesService, AlumniEicHasCoursesService  alumniEic_has_coursesService, CityService cityService, CountryService countryService) {
        alumniEic_has_coursesService.cleanAssociation(file);// Clean association between alumni_eic and course
    }

}
