package com.feupAlumni.alumniFEUP.repository;
import com.feupAlumni.alumniFEUP.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {
    boolean existsByAbbreviation(String course);    
    Course findByAbbreviation(String course);    
}