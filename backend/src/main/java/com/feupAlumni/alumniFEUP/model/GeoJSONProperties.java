package com.feupAlumni.alumniFEUP.model;

import java.util.List;

public class GeoJSONProperties {
    
    private List<String> name;
    private int students;
    private List<String> listAlumniNames ;
    private List<String> listLinkedinLinks ;

    public void setName(List<String> name) {
        this.name = name;
    }

    public List<String> getName() {
        return name;
    }

    public void setStudents(int students) {
        this.students = students;
    }

    public int getStudents() {
        return students;
    }

    public void setListAlumniNames(List<String> listAlumniNames) {
        this.listAlumniNames = listAlumniNames;
    }

    public List<String> getListAlumniNames() {
        return listAlumniNames;
    }

    public void setListLinkedinLinks(List<String> listLinkedinLinks) {
        this.listLinkedinLinks = listLinkedinLinks;
    }

    public List<String> getListLinkedinLinks() {
        return listLinkedinLinks;
    }

}
