package com.feupAlumni.alumniFEUP.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.model.AlumniEic;
import com.feupAlumni.alumniFEUP.model.AlumniEic_has_Course;

public interface AlumniEicHasCoursesService {
    
    // Populates the AlumniEic_Has_Courses_Table
    // If the alumni is in the Excel, than it's possible to know its course and therefore he is added to the alumni_has_course table
    public void populateAlumniEicHasCoursesTable(MultipartFile file);

    // Verifies if the alumni has at least one course that is the same as the courseFilter
    public boolean isFromCourse(AlumniEic alumni, String courseFilter);

    // Verifies if the alumni has at least one course that finished in the yearFilter
    // yearFilter.get(0) => From year
    // yearFilter.get(1) => To year
    // Validations: If from year has value to year also has to have value
    //                        "From year" might have value and "to year" don't
    //                        Both fields can be empty
    //                        If both have value, then the "to year" should be bigger than the "from year"
    public boolean isFromConclusionYear(AlumniEic alumni, List<String> yearFilter);

    // Saves the relationshiip between the Alumni and the Course in the DB
    public void saveRelationAlumniCourse(AlumniEic_has_Course alumniEicHasCourse);

    // Cleans the AlumniEicHasCourse Table
    public void cleanAlumniEicHasCourseTable();

}

