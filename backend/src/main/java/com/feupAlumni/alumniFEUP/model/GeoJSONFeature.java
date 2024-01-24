package com.feupAlumni.alumniFEUP.model;

public class GeoJSONFeature {

    private String type;
    private GeoJSONProperties properties;
    private GeoJSONGeometry geometry;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public GeoJSONProperties getProperties() {
        return properties;
    }

    public void setProperties(GeoJSONProperties properties) {
        this.properties = properties;
    }

    public GeoJSONGeometry getGeometry() {
        return geometry;
    }

    public void setGeometry(GeoJSONGeometry geometry) {
        this.geometry = geometry;
    }
    
}
