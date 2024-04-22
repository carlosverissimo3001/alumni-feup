package com.feupAlumni.alumniFEUP.model;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// View: "The system should be able to show the alumni distribution in different countries and cyties" 
// This view contains the data needed to perform this funcitonality
@Entity
public class Country {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id; // Primary key and auto incremented
    private String country;
    private String countryCode;
    private String countryCoordinates;


    public Country(){

    }

    public Country(String country, String countryCode, int nAlumniInCountry, String countryCoordinates){
        this.country = country;
        this.countryCode = countryCode;
        this.countryCoordinates = countryCoordinates;
    }

    public int getId() {
        return id;
    }

    public String getCountry() {
        return country;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public String getCountryCoordinates() {
        return countryCoordinates;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public void setCountryCoordinates(String countryCoordinates) {
        this.countryCoordinates = countryCoordinates;
    }
}
