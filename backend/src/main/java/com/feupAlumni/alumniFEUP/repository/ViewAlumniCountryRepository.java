package com.feupAlumni.alumniFEUP.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.feupAlumni.alumniFEUP.model.ViewAlumniCountry;

@Repository
public interface ViewAlumniCountryRepository extends JpaRepository<ViewAlumniCountry, Integer> {


}
