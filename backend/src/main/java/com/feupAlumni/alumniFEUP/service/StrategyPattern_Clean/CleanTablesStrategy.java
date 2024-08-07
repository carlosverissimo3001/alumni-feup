package com.feupAlumni.alumniFEUP.service.StrategyPattern_Clean;

import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.service.AlumniEicHasCoursesService;
import com.feupAlumni.alumniFEUP.service.AlumniEicService;
import com.feupAlumni.alumniFEUP.service.AlumniService;
import com.feupAlumni.alumniFEUP.service.CityService;
import com.feupAlumni.alumniFEUP.service.CountryService;
import com.feupAlumni.alumniFEUP.service.CourseService;

public interface CleanTablesStrategy {

    // Cleans tables based on a strategy: if ReplaceAlumnus => cleans all tables, inlcuding the Alumni
    //                                    if addAlumnus => cleans all tables, exept the Alumni
    void cleanTables(MultipartFile file, AlumniService alumniService, AlumniEicService alumniEicService, CourseService coursesService, AlumniEicHasCoursesService  alumniEic_has_coursesService, CityService cityService, CountryService countryService);
}

