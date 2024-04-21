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

    public City(){

    }

    public City(String city, String cityCoordinates, int nAlumniInCity){
        this.city = city;
        this.cityCoordinates = cityCoordinates;
    }

    public String getCity() {
        return city;
    }

    public String getCityCoordinates() {
        return cityCoordinates;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setCityCoordinates(String cityCoordinates) {
        this.cityCoordinates = cityCoordinates;
    }
    
}
