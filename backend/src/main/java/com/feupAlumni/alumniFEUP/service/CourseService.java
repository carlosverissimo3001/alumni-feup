package com.feupAlumni.alumniFEUP.service;

import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.model.Course;

public interface CourseService {
    // Populates Courses table
    public void populateCoursesTable(MultipartFile file);

    // Saves a course in the table
    public void savesCourse(Course course);

    // Returns if a course exists
    public boolean courseExists(String course);

    // Finds a course based on its abreviation
    public Course findCourseByAbreviation(String course);

    // Clean Course table
    public void cleanCourseTable();
}

