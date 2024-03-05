package com.feupAlumni.alumniFEUP.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.feupAlumni.alumniFEUP.model.ViewAlumniCity;

@Repository
public interface ViewAlumniCityRepository extends JpaRepository<ViewAlumniCity, Integer> {
    
}


