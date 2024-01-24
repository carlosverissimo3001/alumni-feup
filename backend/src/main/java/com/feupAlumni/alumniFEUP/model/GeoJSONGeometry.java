package com.feupAlumni.alumniFEUP.model;
import java.util.ArrayList;
import java.util.List;

public class GeoJSONGeometry {
    
    private String type;
    private List<Double> coordinates = new ArrayList<>();

    public void setType(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }

    public void setCoordinates(List<Double> coordinates) {
        this.coordinates = coordinates;
    }

    public List<Double> getCoordinates() {
        return coordinates;
    }

}
