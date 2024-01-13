package com.feupAlumni.alumniFEUP.repository;

import com.feupAlumni.alumniFEUP.model.Alumni;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlumniRepository extends JpaRepository<Alumni, Integer> {


}
