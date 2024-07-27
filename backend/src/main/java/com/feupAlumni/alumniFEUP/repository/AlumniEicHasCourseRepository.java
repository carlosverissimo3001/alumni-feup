package com.feupAlumni.alumniFEUP.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.feupAlumni.alumniFEUP.model.AlumniEic;
import com.feupAlumni.alumniFEUP.model.AlumniEic_has_Course;

@Repository
public interface AlumniEicHasCourseRepository extends JpaRepository<AlumniEic_has_Course, Integer> {
    List<AlumniEic_has_Course> findByAlumniEic(AlumniEic alumniEic);
}
