package com.feupAlumni.alumniFEUP.model;
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

    public Alumni(){
        
    }

    public Alumni(String linkedinLink){
        this.linkedinLink = linkedinLink;
    }

    public int getId() {
        return id;
    }

    public String getLinkedinLink() {
        return linkedinLink;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setLinkedinLink(String linkedinLink) {
        this.linkedinLink = linkedinLink;
    }
}
