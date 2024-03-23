package com.feupAlumni.alumniFEUP.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.feupAlumni.alumniFEUP.model.Country;

@Repository
public interface CountryRepository extends JpaRepository<Country, Integer> {
    Country findByCountry(String countryName);
}
