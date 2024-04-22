package com.feupAlumni.alumniFEUP.model;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

import java.util.ArrayList;
import java.util.List;


@Entity
public class AlumniEic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", referencedColumnName = "id")
    private City city;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", referencedColumnName = "id")
    private Country country;
    private String linkedinLink;
    private String alumniName;

    @OneToMany(mappedBy = "alumniEic", cascade = CascadeType.ALL)
    private List<AlumniEic_has_Course> alumniEicHasCourse = new ArrayList<>();

    public AlumniEic(){

    }

    public AlumniEic(String alumniName, String linkedinLink, City city, Country country){
        this.linkedinLink = linkedinLink;
        this.alumniName = alumniName;
        this.city = city;
        this.country = country;
    }

    public int getId() {
        return id;
    }

    public String getAlumniName() {
        return alumniName;
    }

    public void setAlumniName(String alumniName) {
        this.alumniName = alumniName;
    }

    public String getLinkedinLink() {
        return linkedinLink;
    }

    public void setLinkedinLink(String linkedinLink) {
        this.linkedinLink = linkedinLink;
    }

    public City getCity() {
        return city;
    }

    public void setCity(City city) {
        this.city = city;
    }

    public Country getCountry() {
        return country;
    }

    public void setCountry(Country country) {
        this.country = country;
    }

    public List<AlumniEic_has_Course> getAlumniEicHasCourse() {
        return alumniEicHasCourse;
    }
}
