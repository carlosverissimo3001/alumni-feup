package com.feupAlumni.alumniFEUP.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.feupAlumni.alumniFEUP.model.AlumniEic_has_Course;

@Repository
public interface AlumniEicHasCourseRepository extends JpaRepository<AlumniEic_has_Course, Integer> {
    
}
