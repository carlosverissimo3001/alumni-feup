package com.feupAlumni.alumniFEUP.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.model.AlumniEic;
import com.feupAlumni.alumniFEUP.model.AlumniEic_has_Course;

public interface AlumniEicHasCoursesService {
    
    // Populates the AlumniEic_Has_Courses_Table
    // If the alumni is in the Excel, than it's possible to know its course and therefore he is added to the alumni_has_course table
    public void populateAlumniEicHasCoursesTable(MultipartFile file);

    // Saves the relationshiip between the Alumni and the Course in the DB
    public void saveRelationAlumniCourse(AlumniEic_has_Course alumniEicHasCourse);

    // Returns the courses and respective conclusion year of the received AlumniEIC
    public List<AlumniEic_has_Course> getCourseConclusionYearAlumniEic(AlumniEic alumniEic);

    // Cleans the AlumniEicHasCourse Table
    public void cleanAlumniEicHasCourseTable();

    // Cleand the association between a alumniEic and courses
    public void cleanAssociation(MultipartFile file);

}

