package com.feupAlumni.alumniFEUP.model;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Alumni {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id; // Primary key and auto incremented
    private String linkedinLink;
    @Column(columnDefinition = "JSON")
    private String linkedinInfo; // Json format

    public Alumni(){

    }

    public Alumni(String linkedinLink, String linkedinInfo){
        this.linkedinLink = linkedinLink;
        this.linkedinInfo = linkedinInfo;
    }

    public int getId() {
        return id;
    }

    public String getLinkedinLink() {
        return linkedinLink;
    }

    public String getLinkedinInfo() {
        return linkedinInfo;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setLinkedinLink(String linkedinLink) {
        this.linkedinLink = linkedinLink;
    }

    public void setLinkedinInfo(String linkedinInfo){
        this.linkedinInfo = linkedinInfo;
    }
}
