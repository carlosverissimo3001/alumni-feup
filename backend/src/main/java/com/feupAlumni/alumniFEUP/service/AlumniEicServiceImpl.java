package com.feupAlumni.alumniFEUP.service;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.feupAlumni.alumniFEUP.handlers.FilesHandler;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.model.AlumniEic;
import com.feupAlumni.alumniFEUP.model.AlumniEic_has_Course;
import com.feupAlumni.alumniFEUP.model.City;
import com.feupAlumni.alumniFEUP.model.Country;
import com.feupAlumni.alumniFEUP.model.LocationAlumnis;
import com.feupAlumni.alumniFEUP.repository.AlumniEicRepository;
import com.google.gson.Gson;

@Service
public class AlumniEicServiceImpl implements AlumniEicService{
    
    @Autowired
    private AlumniEicRepository alumniEicRepository;
    @Autowired
    private CountryService countryService;
    @Autowired
    private CityService cityService;
    @Autowired
    private AlumniService alumniService;
    @Autowired
    private AlumniEicHasCoursesService alumniEicHasCoursesService;

    @Override
    public void populateAlumniEicTable() {
        // Iterates over the alumni table
        List<Alumni> alumniList = alumniService.getAllAlumnis();
        for (Alumni alumni : alumniList) { // Adds the alumni to the AlumniEIC table
            // Get data from the alumni
            String linkedinInfo = alumni.getLinkedinInfo();
            String firstName = FilesHandler.extractFieldFromJson("first_name", linkedinInfo);
            String lastName = FilesHandler.extractFieldFromJson("last_name", linkedinInfo);
            String fullName = firstName + " " + lastName;
            String countryName = FilesHandler.extractFieldFromJson("country_full_name", linkedinInfo);
            String cityName = FilesHandler.extractFieldFromJson("city", linkedinInfo);
            String publicIdentifier = FilesHandler.extractFieldFromJson("public_identifier", linkedinInfo);
            String linkedinFullLink = "https://www.linkedin.com/in/" + publicIdentifier + "/";

            City city = cityService.findCityByName(cityName);
            Country country = countryService.getCountryByName(countryName);

            // Saves the alumni in the DB
            AlumniEic alumniEic = new AlumniEic(fullName, linkedinFullLink, city, country);
            savesAlumniEic(alumniEic);
        }
        System.out.println("AlumniEIC table re-populated");
        System.out.println("-----"); 
    }

    @Override
    public void generateGeoJsonAlumniEic(File locationGeoJSON, String courseFilter, List<String> yearFilter, String geoJsonType) {
        // Creates the GeoJson file depending on geoJsonType
        Map<File, Gson> fileGson = FilesHandler.createFile(locationGeoJSON);
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
            FilesHandler.addContentInGeoJson(alumniByLocation, alumniLinkedInLink, alumniByCourseYearConclusion, fileGson);
        }
    }

    @Override
    public Map<LocationAlumnis, List<AlumniEic>> groupAlumnis(String geoJsonType) {
        List<AlumniEic> alumniList = getAllAlumniEic();
        Map<LocationAlumnis, List<AlumniEic>> alumniByLocation = new HashMap<>();
        if (geoJsonType.equals("cities")) {
            alumniList.forEach(alumni -> {
                if(alumni.getCity() != null) {
                    // Grabs the alumni city
                    LocationAlumnis city = alumni.getCity();
                    // Grabs the already existing list of alumnis associated with the city
                    List<AlumniEic> alumniListCity = alumniByLocation.getOrDefault(city, new ArrayList<>());
                    // Concatenates the current alumni with the existing ones
                    alumniListCity.add(alumni);
                    // Updates the map
                    alumniByLocation.put(city, alumniListCity);
                }
            });
        } else {
            alumniList.forEach(alumni -> {
                if (alumni.getCountry() != null) {
                    // Grabs the alumnis' country
                    LocationAlumnis country = alumni.getCountry();
                    // Grabs the already existing list of alumnis associated with the country
                    List<AlumniEic> alumniListCountry = alumniByLocation.getOrDefault(country, new ArrayList<>());
                    // Concatenates the current alumni with the existing ones
                    alumniListCountry.add(alumni);
                    // Update the map
                    alumniByLocation.put(country, alumniListCountry);
                }
            });
        }   
        return alumniByLocation;
    }

    @Override
    public Map<String, String> alumniLinkedInLink(String courseFilter, List<String> yearFilter) {
        Map<String, String> listLinkedinLinksByUser = new HashMap<>();
        List<AlumniEic> allAlumniEic = getAllAlumniEic();
        for (AlumniEic alumni : allAlumniEic) {
            String linkdeinLink = alumni.getLinkedinLink();
            String alumniName = alumni.getAlumniName();
            if (alumniEicHasCoursesService.isFromCourse(alumni, courseFilter) && alumniEicHasCoursesService.isFromConclusionYear(alumni, yearFilter)) {
                listLinkedinLinksByUser.put(linkdeinLink, alumniName);
            }
        }
        return listLinkedinLinksByUser;
    }

    @Override
    public Map<String, Map<String, String>> alumniByCourseYearConclusion(String courseFilter, List<String> yearFilter) {
        Map<String, Map<String, String>> alumniByCourseYearConclusion = new HashMap<>();
        List<AlumniEic> allAlumniEic = getAllAlumniEic();
        for (AlumniEic alumni : allAlumniEic) {
            Map<String, String> coursesYearConclusion = new HashMap<>();
            if (alumniEicHasCoursesService.isFromCourse(alumni, courseFilter) && alumniEicHasCoursesService.isFromConclusionYear(alumni, yearFilter)) {
                for (AlumniEic_has_Course alumniCourse : alumni.getAlumniEicHasCourse()) {
                    String courseAbrev = alumniCourse.getCourse().getAbbreviation();
                    coursesYearConclusion.put(courseAbrev, alumniCourse.getYearOfConclusion());
                }
                alumniByCourseYearConclusion.put(alumni.getLinkedinLink(), coursesYearConclusion);
            }
        }
        return alumniByCourseYearConclusion;
    }

    @Override
    public void savesAlumniEic(AlumniEic alumniEic) {
        alumniEicRepository.save(alumniEic);
    }

    @Override
    public List<AlumniEic> getAllAlumniEic() {
        return alumniEicRepository.findAll();
    }

    @Override
    public void celanAlumniEicTable() {
        if (alumniEicRepository.count() > 0) {
            try {
                System.out.println("-----");
                System.out.println("Registers are going to be deteled from: " + alumniEicRepository);
                alumniEicRepository.deleteAll();
            } catch (Exception e) {
                e.printStackTrace();
            }
        } 
    }

}
