package com.feupAlumni.alumniFEUP.model;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// View: "The system should be able to show the alumni distribution in different countries and cyties" 
// This view contains the data needed to perform this funcitonality
@Entity
public class ViewAlumniCountry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id; // Primary key and auto incremented
    private String country;
    private int nAlumniInCountry;


    public ViewAlumniCountry(){

    }

    public ViewAlumniCountry(String country, int nAlumniInCountry){
        this.country = country;
        this.nAlumniInCountry = nAlumniInCountry;
    }

    public int getId() {
        return id;
    }

    public String getCountry() {
        return country;
    }

    public int getNAlumniInCountry() {
        return nAlumniInCountry;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setNAlumniInCountry(int nAlumniInCountry) {
        this.nAlumniInCountry = nAlumniInCountry;
    }
}
