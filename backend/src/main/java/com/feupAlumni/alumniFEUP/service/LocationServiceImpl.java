package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.handlers.Location;
import com.feupAlumni.alumniFEUP.model.AlumniEic;
import com.feupAlumni.alumniFEUP.model.AlumniEic_has_Course;
import com.feupAlumni.alumniFEUP.model.City;
import com.feupAlumni.alumniFEUP.model.LocationAlumnis;
import com.feupAlumni.alumniFEUP.repository.AlumniEicRepository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.stream.Collectors;
import java.io.File;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

@Service
public class LocationServiceImpl implements LocationService {

    @Autowired
    private AlumniEicRepository alumniEicRepository;

    // Creates the geoJson file based in country or city type
    private Map<File, Gson> createFile(String geoJsonType) {
        Map<File, Gson> fileGeoJson = new HashMap<>();
        File geoJSONFile;
        if (geoJsonType.equals("cities")) {
            geoJSONFile = new File("frontend/src/citiesGeoJSON.json");
            
        } else {
            geoJSONFile = new File("frontend/src/countriesGeoJSON.json");
        }
        Gson gson = new GsonBuilder().setPrettyPrinting().create(); 
        Location.createEmptyGeoJSONFile(geoJSONFile);
        System.out.println("GeoJSON file created");
        fileGeoJson.put(geoJSONFile, gson);
        return fileGeoJson;
    }      

    // Groups alumnis based on countries or cities
    private Map<LocationAlumnis, List<AlumniEic>> groupAlumnis(String geoJsonType) {
        List<AlumniEic> alumniList = alumniEicRepository.findAll();
        if (geoJsonType.equals("cities")) {
            Map<LocationAlumnis, List<AlumniEic>> alumniByLocation = new HashMap<>();
            alumniList.forEach(alumni -> {
                if(alumni.getCity() != null) {
                    LocationAlumnis city = alumni.getCity();
                    
                    // Grabs the already existing list of alumnis associated with the city
                    List<AlumniEic> alumniListCity = alumniByLocation.getOrDefault(city, new ArrayList<>());

                    // Concatenates the current alumni with the existing ones
                    alumniListCity.add(alumni);

                    // Updates the map
                    alumniByLocation.put(city, alumniListCity);
                }
            });
            return alumniByLocation;
        } else {
            return alumniList.stream()
            .collect(Collectors.groupingBy(AlumniEic::getCountry));
        }   
    }

    // Associates each alumni to a LinkedIn link
    private Map<String, String> alumniLinkedInLink(String courseFilter) {
        Map<String, String> listLinkedinLinksByUser = new HashMap<>();
        for (AlumniEic alumni : alumniEicRepository.findAll()) {
            String linkdeinLink = alumni.getLinkedinLink();
            String alumniName = alumni.getAlumniName();
            if (!courseFilter.equals("")) {
                List<AlumniEic_has_Course> alumniCourses = alumni.getAlumniEicHasCourse();
                for (AlumniEic_has_Course course : alumniCourses) {
                    String abrev = course.getCourse().getAbbreviation();
                    if (abrev.equals(courseFilter)) {
                        listLinkedinLinksByUser.put(alumniName, linkdeinLink);
                    }
                }
            } else {
                listLinkedinLinksByUser.put(alumniName, linkdeinLink);
            }
        }
        return listLinkedinLinksByUser;
    }

    private Map<String, Map<String, String>> alumniByCourseYearConclusion(String courseFilter) {
        Map<String, Map<String, String>> alumniByCourseYearConclusion = new HashMap<>();
        for (AlumniEic alumni : alumniEicRepository.findAll()) {
            Map<String, String> coursesYearConclusion = new HashMap<>();
            if (courseFilter.length() > 0) {
                var containsCourseFilter = false;
                for (AlumniEic_has_Course alumniCourse : alumni.getAlumniEicHasCourse()) {
                    String courseAbrev = alumniCourse.getCourse().getAbbreviation();
                    if (courseAbrev.equals(courseFilter)) {
                        containsCourseFilter = true;
                    }
                    coursesYearConclusion.put(courseAbrev, alumniCourse.getYearOfConclusion());
                }
                if (containsCourseFilter) {
                    alumniByCourseYearConclusion.put(alumni.getAlumniName(), coursesYearConclusion);
                }
            } else {
                for (AlumniEic_has_Course alumniCourse : alumni.getAlumniEicHasCourse()) {
                    String courseAbrev = alumniCourse.getCourse().getAbbreviation();
                    coursesYearConclusion.put(courseAbrev, alumniCourse.getYearOfConclusion());
                }   
                alumniByCourseYearConclusion.put(alumni.getAlumniName(), coursesYearConclusion);
            }
        }
        return alumniByCourseYearConclusion;
    }

    // Writes the content in the geoJson
    private void addContentInGeoJson(Map<LocationAlumnis, List<AlumniEic>> alumniByLocation, Map<String, String> alumniLinkedInLink, Map<String, Map<String, String>> alumniByCourseYearConclusion, Map<File, Gson> fileGson) {
        alumniByLocation.forEach((location, alumniList) -> {
            // From the map of all alumnis associated with the respecitve linkedin link (alumniLinkedInLink)
            // it only extracts the the alumnis from the alumniList of the current location
            Map<String, String> alumniLinkedinLinkForLocation = alumniLinkedInLink.entrySet().stream()
                .filter(entry -> alumniList.stream().anyMatch(alumni -> alumni.getAlumniName().equals(entry.getKey())))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

            // From the map of all alumnis associated with the respective course and year of conclusion (alumniByCourseYearConclusion)
            // it only extracts the alumnis from the alumniList of the current location
            Map<String, Map<String, String>> alumniByCourseYearConclusionForLocation = alumniByCourseYearConclusion.entrySet().stream()
            .filter(entry -> alumniList.stream().anyMatch(alumni -> alumni.getAlumniName().equals(entry.getKey())))
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

            Map.Entry<File, Gson> fileGsonIteration = fileGson.entrySet().iterator().next();
            Location.addLocationGeoJson(location, alumniLinkedinLinkForLocation, alumniByCourseYearConclusionForLocation, fileGsonIteration.getKey(), fileGsonIteration.getValue());
        });
    }

    @Override
    public void generateGeoJson(String courseFilter, List<String> yearFilter, String geoJsonType) {
        // Creates the GeoJason file depending on geoJsonType
        Map<File, Gson> fileGson = createFile(geoJsonType);

        // Group alumnis in countries or cities depending on geoJsonType
        Map<LocationAlumnis, List<AlumniEic>> alumniByLocation = groupAlumnis(geoJsonType);

        // For each alumni associates the linkedin link he is associated with
        // Key: alumni name value: linkedin link
        Map<String, String> alumniLinkedInLink = alumniLinkedInLink(courseFilter);

        // For each alumni associates a course with the respective year of conclusion 
        // Key: alumni Vlaue: map where key: course and value: year of conclusion
        Map<String, Map<String, String>> alumniByCourseYearConclusion = alumniByCourseYearConclusion(courseFilter);

        // Adds the content to the geoJson
        addContentInGeoJson(alumniByLocation, alumniLinkedInLink, alumniByCourseYearConclusion, fileGson);
    }
}
