package com.feupAlumni.alumniFEUP.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class City {

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

    public String getCity() {
        return city;
    }

    public String getCityCoordinates() {
        return cityCoordinates;
    }

    public int getNAlumniInCity() {
        return nAlumniInCity;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setCityCoordinates(String cityCoordinates) {
        this.cityCoordinates = cityCoordinates;
    }

    public void setNAlumniInCity(int nAlumniInCity) {
        this.nAlumniInCity = nAlumniInCity;
    }
    
}
