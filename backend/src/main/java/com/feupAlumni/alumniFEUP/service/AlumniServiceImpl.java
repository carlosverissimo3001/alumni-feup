package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.handlers.ExcelFilesHandler;
import com.feupAlumni.alumniFEUP.handlers.JsonFileHandler;
import com.feupAlumni.alumniFEUP.handlers.Location;
import com.feupAlumni.alumniFEUP.handlers.ManageApiData;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;
import com.feupAlumni.alumniFEUP.service.StrategyPattern_PopulateAlumni.AlumniStrategy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

@Service
public class AlumniServiceImpl implements AlumniService{

    @Autowired
    private AlumniRepository alumniRepository;

    @Override
    public void populateAlumniTable(MultipartFile file, AlumniStrategy strategy) throws IOException, InterruptedException {
        strategy.populateAlumniTable(file);
    }

    @Override
    public byte[] alumniTableToExcel() {
        // Load the Excel file
        Workbook workbook = new XSSFWorkbook(); // Creates a new workbook
        Sheet sheet = workbook.createSheet("Alumni"); // Create a new sheet

        try {
            // 1st on the sublist is the row where which title should be 
            String[][] fields = ManageApiData.getFields();
            
            // Write Excel Titles
            ExcelFilesHandler.createHeaders(sheet, fields);

            // Iterate over each row of the excel and writes the content of the tiles written before
            Iterator<Alumni> alumniIterator = alumniRepository.findAll().iterator();
            int rowIndex=2;
            while (alumniIterator.hasNext()) {
                Alumni alumni = alumniIterator.next();
                String linkedinInfo = alumni.getLinkedinInfo();

                int lastWrittenRow = ExcelFilesHandler.writeAlumniDataToRow(alumni, rowIndex, linkedinInfo, sheet, fields);

                rowIndex = lastWrittenRow;
            }

            // Save the modified workbook to a byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            byte[] modifiedExcelBytes = outputStream.toByteArray();
            return modifiedExcelBytes;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        } finally {
            // Close the workbook in the finally block to ensure it's always closed
            if (workbook != null) {
                try {
                    workbook.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
 
    @Override
    public void addAlumni(Alumni alumni) {
        alumniRepository.save(alumni);
    }

    @Override
    public List<Alumni> getAllAlumnis() {
        return alumniRepository.findAll();
    }

    @Override
    public boolean linkedinExists(String linkValue) {
        return alumniRepository.existsByLinkedinLink(linkValue);
    } 

    @Override
    public Alumni findByLinkedinLink(String linkValue) {
        return alumniRepository.findByLinkedinLink(linkValue);
    }

    @Override
    public ArrayList<Map<String, String>> getCityInformation() throws IOException, InterruptedException {

        List<Alumni> alumniList = alumniRepository.findAll();
        Map<String, String> cityCoordinatesCountries = new HashMap<>(); // Keys: citiy name Value: city coordinates
        Map<String, Integer> cityCoordinateAlumniCount = new HashMap<>(); // Key: City Coordinate Value: Alumni Count
        Map<String, String> failedAttemptsAPI = new HashMap<>(); // Stores the city names that the API was not able to get the coordinates. It's stored on a map for easy access
        
        Map<String, String> convertCityNames = new HashMap<>(); // Converts unacceptable city names to acceptable ones
        convertCityNames.put("porto metropolitan area", "porto");
        convertCityNames.put("brussels metropolitan area", "brussels"); 
        convertCityNames.put("porto e região", "porto"); 
        convertCityNames.put("kraków i okolice", "kraków");
        convertCityNames.put("greater guimaraes area", "guimarães"); 
        convertCityNames.put("hamburg und umgebung", "hamburg"); 
        convertCityNames.put("braga e região", "braga"); 
        convertCityNames.put("greater viana do castelo area", "viana do castelo"); 
        convertCityNames.put("antwerp metropolitan area", "antwerp"); 
        convertCityNames.put("metropolregion berlin/brandenburg", "berlin"); 
        convertCityNames.put("greater ipswich area", "ipswich"); 
        convertCityNames.put("greater madrid metropolitan area", "madrid"); 
        convertCityNames.put("pontevedra y alrededores", "pontevedra"); 
        convertCityNames.put("greater cambridge area", "cambridge"); 
        convertCityNames.put("oslo og omegn", "oslo"); 
        convertCityNames.put("greater tokyo area", "tokyo");
        convertCityNames.put("greater barcelona metropolitan area", "barcelona"); 
        convertCityNames.put("greater cardiff area", "cardiff"); 
        convertCityNames.put("greater oslo region", "oslo");
        convertCityNames.put("greater aveiro area", "aveiro"); 
        convertCityNames.put("the randstad", "randstad"); 
        convertCityNames.put("geneva metropolitan area", "geneva");


        for (Alumni alumni : alumniList) { 
            String linkedinInfo = alumni.getLinkedinInfo();
            String city = JsonFileHandler.extractFieldFromJson("city", linkedinInfo);
            String countryAcronym = JsonFileHandler.extractFieldFromJson("country", linkedinInfo);

            // This algorithm avoids unecessary calls to the API that returns city coordinates (there is a limit of ccredits/hour)
            String cityCoordinates = null;
            if (cityCoordinatesCountries.get(city) == null && failedAttemptsAPI.get(city) == null) {
                // Verifies if it is a valid city name, if not, grabs the correct one
                String lowerCaseCity = city.toLowerCase();
                String correctCityName = convertCityNames.get(lowerCaseCity);

                if (correctCityName != null) {
                    // Grabs the coordinates from the API
                    cityCoordinates = Location.getCityCoordinates(correctCityName, countryAcronym);
                } else {
                    // Grabs the coordinates from the API
                    cityCoordinates = Location.getCityCoordinates(city, countryAcronym);
                }

            } else if (cityCoordinatesCountries.get(city) != null && failedAttemptsAPI.get(city) == null) {
                // Grabs the coordinates from the already existing one on the Map
                cityCoordinates = cityCoordinatesCountries.get(city);
            }

            if (cityCoordinates != null) {
                // Updates the map 
                cityCoordinatesCountries.put(city, cityCoordinates);
                cityCoordinateAlumniCount.put(cityCoordinates, cityCoordinateAlumniCount.getOrDefault(cityCoordinates, 0) + 1);
            } else {
                failedAttemptsAPI.put(city, "");
            }
        }
        
        // Convert cityCoordinateAlumniCount to a Map<String, String>
        Map<String, String> cityCoordinateAlumniCountStr = new HashMap<>();
        for (Map.Entry<String, Integer> cityAlumniCount : cityCoordinateAlumniCount.entrySet()) {
            cityCoordinateAlumniCountStr.put(cityAlumniCount.getKey(), String.valueOf(cityAlumniCount.getValue()));
        }

        // Adds the arrays to the ArrayList
        ArrayList<Map<String, String>> result = new ArrayList<>();
        result.add(cityCoordinatesCountries);
        result.add(cityCoordinateAlumniCountStr);

        return result;
    }

    // Gets the alumni distribution per country
    @Override
    public void getAlumniDistCountry(Map<String, Integer> countryAlumniCount, Map<String, String> countryCodes) {
        // Accesses the Alumni table and populates the ViewAlumniCountry table
        List<Alumni> alumniList = alumniRepository.findAll();
        // Puts in a map the countries (as keys) and the number of alumni for each country (as value)
        for (Alumni alumni : alumniList) {
            String linkedinInfo = alumni.getLinkedinInfo();
            String country = JsonFileHandler.extractFieldFromJson("country_full_name", linkedinInfo);
            String countryCode = JsonFileHandler.extractFieldFromJson("country", linkedinInfo);

            // Ensures consistency across fields
            country = country.toLowerCase();
            countryCode = countryCode.toUpperCase();

            // Update the count for the country in the map
            countryAlumniCount.put(country, countryAlumniCount.getOrDefault(country, 0) + 1);
            // Adds the country code
            countryCodes.put(country, countryCode);
        }
    } 

    @Override
    public void cleanAlumniTable() {
        if (alumniRepository.count() > 0) {
            try {
                System.out.println("-----");
                System.out.println("Registers are going to be deteled from: " + alumniRepository);
                alumniRepository.deleteAll();
            } catch (Exception e) {
                e.printStackTrace();
            }
        } 
    }
}
