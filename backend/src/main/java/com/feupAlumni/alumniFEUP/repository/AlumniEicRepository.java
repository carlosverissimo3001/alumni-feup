package com.feupAlumni.alumniFEUP.repository;

import com.feupAlumni.alumniFEUP.model.AlumniEic;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlumniEicRepository extends JpaRepository<AlumniEic, Integer> {
    AlumniEic findByLinkedinLink(String linkedinLink);

}
