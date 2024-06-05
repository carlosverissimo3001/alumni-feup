package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.handlers.Location;
import com.feupAlumni.alumniFEUP.model.AlumniEic;
import com.feupAlumni.alumniFEUP.model.AlumniEic_has_Course;
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
        File geoJSONFile = new File("frontend/src/locationGeoJSON.json");
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

    // Verifies if the alumni has at least one course that is the same as the courseFilter
    private boolean isFromCourse(AlumniEic alumni, String courseFilter) {
        if (!courseFilter.equals("")) {
            List<AlumniEic_has_Course> alumniCourses = alumni.getAlumniEicHasCourse();
            for (AlumniEic_has_Course course : alumniCourses) {
                String abrev = course.getCourse().getAbbreviation();
                if (abrev.equals(courseFilter)) {
                    return true;
                }
            }
            return false;
        }
        return true;
    }

    // Verifies if the alumni has at least one course that finished in the yearFilter
    // yearFilter.get(0) => From year
    // yearFilter.get(1) => To year
    // Validations: If from year has value to year also has to have value
    //                        "From year" might have value and "to year" don't
    //                        Both fields can be empty
    //                        If both have value, then the "to year" should be bigger than the "from year"
    private boolean isFromConclusionYear(AlumniEic alumni, List<String> yearFilter) {
        if (!yearFilter.get(0).equals("")) { // There is a From year
            List<AlumniEic_has_Course> alumniCourses = alumni.getAlumniEicHasCourse();
            for (AlumniEic_has_Course course : alumniCourses) {
                String[] yearConclusion = course.getYearOfConclusion().split("/"); // [2023, 2024]
                if (!yearFilter.get(1).equals("")) { // There is a To year => Interval
                    // Validates the years: if there is a value "to year", then this second value has to be bigger than the "from year"
                    if (Integer.parseInt(yearFilter.get(0)) <= Integer.parseInt(yearFilter.get(1))) {
                        if (Integer.parseInt(yearFilter.get(0)) <= Integer.parseInt(yearConclusion[1]) &&
                            Integer.parseInt(yearFilter.get(1)) >= Integer.parseInt(yearConclusion[1])
                        ) {
                            return true;
                        }
                    } 
                    return false;
                } else { // There isn't a To year => it shows from that year beyond
                    if (Integer.parseInt(yearConclusion[1]) >= Integer.parseInt(yearFilter.get(0))) {
                        return true;
                    }
                }
            }
            return false;
        }
        return true;
    }

    // Associates each alumni to a LinkedIn link
    private Map<String, String> alumniLinkedInLink(String courseFilter, List<String> yearFilter) {
        Map<String, String> listLinkedinLinksByUser = new HashMap<>();
        for (AlumniEic alumni : alumniEicRepository.findAll()) {
            String linkdeinLink = alumni.getLinkedinLink();
            String alumniName = alumni.getAlumniName();
            if (isFromCourse(alumni, courseFilter) && isFromConclusionYear(alumni, yearFilter)) {
                listLinkedinLinksByUser.put(linkdeinLink, alumniName);
            }
        }
        return listLinkedinLinksByUser;
    }

    // Associates each alumni to a course and the respective year of conclusion
    private Map<String, Map<String, String>> alumniByCourseYearConclusion(String courseFilter, List<String> yearFilter) {
        Map<String, Map<String, String>> alumniByCourseYearConclusion = new HashMap<>();
        for (AlumniEic alumni : alumniEicRepository.findAll()) {
            Map<String, String> coursesYearConclusion = new HashMap<>();
            if (isFromCourse(alumni, courseFilter) && isFromConclusionYear(alumni, yearFilter)) {
                for (AlumniEic_has_Course alumniCourse : alumni.getAlumniEicHasCourse()) {
                    String courseAbrev = alumniCourse.getCourse().getAbbreviation();
                    coursesYearConclusion.put(courseAbrev, alumniCourse.getYearOfConclusion());
                }
                alumniByCourseYearConclusion.put(alumni.getLinkedinLink(), coursesYearConclusion);
            }
        }
        return alumniByCourseYearConclusion;
    }

    // Writes the content in the geoJson
    private void addContentInGeoJson(Map<LocationAlumnis, List<AlumniEic>> alumniByLocation, Map<String, String> alumniLinkedInLink, Map<String, Map<String, String>> alumniByCourseYearConclusion, Map<File, Gson> fileGson) {
        alumniByLocation.forEach((location, alumniList) -> {
            if (!location.getName().equals("null")) { //doesn't write null locations
                // From the map of all alumnis associated with the respecitve linkedin link (alumniLinkedInLink)
                // it only extracts the the alumnis from the alumniList of the current location
                Map<String, String> alumniLinkedinLinkForLocation = alumniLinkedInLink.entrySet().stream()
                    .filter(entry -> alumniList.stream().anyMatch(alumni -> alumni.getLinkedinLink().equals(entry.getKey())))
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

                // From the map of all alumnis associated with the respective course and year of conclusion (alumniByCourseYearConclusion)
                // it only extracts the alumnis from the alumniList of the current location
                Map<String, Map<String, String>> alumniByCourseYearConclusionForLocation = alumniByCourseYearConclusion.entrySet().stream()
                .filter(entry -> alumniList.stream().anyMatch(alumni -> alumni.getLinkedinLink().equals(entry.getKey())))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

                Map.Entry<File, Gson> fileGsonIteration = fileGson.entrySet().iterator().next();
                Location.addLocationGeoJson(location, alumniLinkedinLinkForLocation, alumniByCourseYearConclusionForLocation, fileGsonIteration.getKey(), fileGsonIteration.getValue());
            }
        });
    }

    @Override
    public void generateGeoJson(String courseFilter, List<String> yearFilter, String geoJsonType) { 
        // Creates the GeoJson file depending on geoJsonType
        Map<File, Gson> fileGson = createFile(geoJsonType);
        System.out.println("geoJsonType: " + geoJsonType);
        if (geoJsonType.equals("countries") || geoJsonType.equals("cities")) {
            // Group alumnis in countries or cities depending on geoJsonType
            Map<LocationAlumnis, List<AlumniEic>> alumniByLocation = groupAlumnis(geoJsonType);

            // For each alumni associates the linkedin link he is associated with + filters applied
            // Key: alumni linkedin link value: linkedin link
            Map<String, String> alumniLinkedInLink = alumniLinkedInLink(courseFilter, yearFilter);

            // For each alumni associates a course with the respective year of conclusion + filters applied
            // Key: alumni linkdin link Vlaue: map where key: course and value: year of conclusion
            Map<String, Map<String, String>> alumniByCourseYearConclusion = alumniByCourseYearConclusion(courseFilter, yearFilter);

            // Adds the content to the geoJson
            addContentInGeoJson(alumniByLocation, alumniLinkedInLink, alumniByCourseYearConclusion, fileGson);
        }
        
    }
}
