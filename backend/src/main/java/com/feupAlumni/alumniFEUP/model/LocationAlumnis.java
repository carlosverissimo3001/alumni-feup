package com.feupAlumni.alumniFEUP.model;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class LocationAlumnis {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    public LocationAlumnis(){
        
    }

    public abstract String getName();
    public abstract String getCoordinates();
    public abstract int getNAlumni();
    public abstract void setNAlumni(int nAlumni);

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}
