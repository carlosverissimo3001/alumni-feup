package com.feupAlumni.alumniFEUP.model;

import java.util.ArrayList;
import java.util.List;

public class GeoJSONStructure {
    private String type = "FeatureCollection";
    private List<GeoJSONFeature> features = new ArrayList<>();

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public List<GeoJSONFeature> getFeatures() {
        return features;
    }

    public void setFeatures(GeoJSONFeature feature) {
        this.features.add(feature);
    }

}
