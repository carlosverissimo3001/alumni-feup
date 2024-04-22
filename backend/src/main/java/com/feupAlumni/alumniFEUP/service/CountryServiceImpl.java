package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.handlers.CleanData;
import com.feupAlumni.alumniFEUP.handlers.FilesHandler;
import com.feupAlumni.alumniFEUP.handlers.Location;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.model.AlumniEic;
import com.feupAlumni.alumniFEUP.model.AlumniEic_has_Course;
import com.feupAlumni.alumniFEUP.model.Country;
import com.feupAlumni.alumniFEUP.repository.AlumniEicRepository;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;
import com.feupAlumni.alumniFEUP.repository.CountryRepository;

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
public class CountryServiceImpl implements CountryService{

    @Autowired
    private CountryRepository countryRepository;
    @Autowired
    private AlumniEicRepository alumniEicRepository;
    @Autowired
    private AlumniRepository alumniRepository;

    // Gets the alumni distribution per country
    private void getAlumniDistCountry(Map<String, Integer> countryAlumniCount, Map<String, String> countryCodes) {
        // Accesses the Alumni table and populates the ViewAlumniCountry table
        List<Alumni> alumniList = alumniRepository.findAll();
        var count = 0;
        // Puts in a map the countries (as keys) and the number of alumni for each country (as value)
        for (Alumni alumni : alumniList) {
            String linkedinInfo = alumni.getLinkedinInfo();
            String country = FilesHandler.extractFieldFromJson("country_full_name", linkedinInfo);
            String countryCode = FilesHandler.extractFieldFromJson("country", linkedinInfo);
            if(countryCode.toUpperCase().equals("SI")){
                System.out.println("alumni: " + alumni.getLinkedinInfo());
                count++;
                System.out.println("----------------------------------------------------------------");
            }

            // Ensures consistency across fields
            country = country.toLowerCase();
            countryCode = countryCode.toUpperCase();

            // Update the count for the country in the map
            countryAlumniCount.put(country, countryAlumniCount.getOrDefault(country, 0) + 1);
            // Adds the country code
            countryCodes.put(country, countryCode);
        }
        System.out.println("count: " + count);
    }      

    @Override
    public void populateCountryTable() {
        CleanData.cleanTable(alumniEicRepository); // it has a foreign key
        CleanData.cleanTable(countryRepository);

        Map<String, Integer> countryAlumniCount = new HashMap<>();
        Map<String, String> countryCodes = new HashMap<>();
        getAlumniDistCountry(countryAlumniCount, countryCodes);

        // Iterate over the map and save the data to ViewAlumniCountry table + Adds the information to the GeoJSON file
        for (Map.Entry<String, Integer> entry : countryAlumniCount.entrySet()) {
            String country = entry.getKey();
            Integer alumniCount = entry.getValue();

            String countryCode = countryCodes.get(country);
            try {
                // Get Country Coordinates
                String coordinates = "";
                if(country != "null"){
                    coordinates = Location.getCountryCoordinates(countryCode);
                }

                // Saves the data in the table
                Country viewAlumniCountry = new Country(country, countryCode, alumniCount, coordinates);
                countryRepository.save(viewAlumniCountry);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        System.out.println("Information added to the GeoJSON file and Table viewAlumniCountryRepository repopulated.");
        System.out.println("-----");
    }

    @Override
    public void generateCountryGeoJson(String courseFilter) {
        // Creates the GeoJason file
        File geoJSONFile = new File("frontend/src/countriesGeoJSON.json");
        Gson gson = new GsonBuilder().setPrettyPrinting().create(); 
        FilesHandler.fileDeletion(geoJSONFile);
        Location.createEmptyGeoJSONFile(geoJSONFile);
        System.out.println("GeoJSON file created");

        // Group AlumniEic by country
        Map<Country, List<AlumniEic>> alumniByCountry = alumniEicRepository.findAll()
            .stream()
            .collect(Collectors.groupingBy(AlumniEic::getCountry));

        // For each alumni associates the linkedin link he is associated with
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

        // For each alumni associates the various courses he was involved and the year of conclusion of each course
        // Key: alumni Vlaue: map where key: course and value: year of conclusion
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

        alumniByCountry.forEach((country, alumniList) -> {
            Map<String, String> filteredListLinkedinLinksByUser = listLinkedinLinksByUser.entrySet().stream()
                .filter(entry -> alumniList.stream().anyMatch(alumni -> alumni.getAlumniName().equals(entry.getKey())))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

            Map<String, Map<String, String>> filteredAlumniByCourseYearConclusion = alumniByCourseYearConclusion.entrySet().stream()
            .filter(entry -> alumniList.stream().anyMatch(alumni -> alumni.getAlumniName().equals(entry.getKey())))
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

            Location.addCountryGeoJSON(country, filteredListLinkedinLinksByUser, filteredAlumniByCourseYearConclusion, geoJSONFile, gson);
        });
    }
}
