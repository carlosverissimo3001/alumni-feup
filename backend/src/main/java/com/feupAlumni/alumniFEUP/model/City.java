package com.feupAlumni.alumniFEUP.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class City extends LocationAlumnis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id; // Primary key and auto incremented
    private String city;
    private String cityCoordinates;
    private int nAlumniInCity;

    public City(){

    }

    public City(String city, String cityCoordinates, int nAlumniInCity){
        this.city = city;
        this.cityCoordinates = cityCoordinates;
        this.nAlumniInCity = nAlumniInCity;
    }

    @Override
    public String getName() {
        return city;
    }

    @Override
    public String getCoordinates() {
        return cityCoordinates;
    }

    @Override
    public int getNAlumni() {
        return nAlumniInCity;
    }

    @Override
    public void setNAlumni(int nAlumniInCity) {
        this.nAlumniInCity = nAlumniInCity;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setCityCoordinates(String cityCoordinates) {
        this.cityCoordinates = cityCoordinates;
    }
    
}
