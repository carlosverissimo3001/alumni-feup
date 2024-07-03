package com.feupAlumni.alumniFEUP.service;

import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.model.AlumniEic_has_Course;

public interface AlumniEicHasCoursesService {
    
    // Populates the AlumniEic_Has_Courses_Table
    // If the alumni is in the Excel, than it's possible to know its course and therefore he is added to the alumni_has_course table
    public void populateAlumniEicHasCoursesTable(MultipartFile file);

    // Saves the relationshiip between the Alumni and the Course in the DB
    public void saveRelationAlumniCourse(AlumniEic_has_Course alumniEicHasCourse);

    // Cleans the AlumniEicHasCourse Table
    public void cleanAlumniEicHasCourseTable();

}

