package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.handlers.AlumniInfo;
import com.feupAlumni.alumniFEUP.handlers.ExcelFilesHandler;
import com.feupAlumni.alumniFEUP.handlers.JsonFileHandler;
import com.feupAlumni.alumniFEUP.handlers.ManageApiData;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
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
    public void populateAlumniTable(MultipartFile file) throws IOException, InterruptedException {
        try (InputStream inputStream = file.getInputStream()){
            // Read the excel file
            Workbook workbook = WorkbookFactory.create(inputStream);
            Sheet sheet = workbook.getSheetAt(1);   // 2nd sheet
            Iterator<Row> rowIterator = sheet.iterator();

            // Skip the first two rows
            for (int i=0; i<2; i++){
                if(rowIterator.hasNext()){
                    rowIterator.next();
                } 
            }

            // Iterate over the excel file
            while (rowIterator.hasNext()) {
                try {
                    Row row = rowIterator.next();

                    // Grabs the linkedin link 
                    String linkValue = row.getCell(4).getStringCellValue();                     
                    linkValue = URLDecoder.decode(linkValue, StandardCharsets.UTF_8.toString());
                    Boolean linkedinExists = linkedinExists(linkValue);

                    if(!linkedinExists && linkValue.length()!=0 ){
                        // Call the API that gets the information of a linkedin profile 
                        var linkedinInfoResponse = AlumniInfo.getLinkedinProfileInfo(linkValue);
                        if(linkedinInfoResponse.statusCode() == 200){
                            // Get the profile pic URL
                            JSONObject jsonResponse = new JSONObject(linkedinInfoResponse.body());
                            String profilePicUrl = jsonResponse.optString("profile_pic_url", null); 
                            String publicIdentifier = jsonResponse.optString("public_identifier", null);

                            // downloads and saves the pic in a local folder
                            AlumniInfo.downloadAndSaveImage(profilePicUrl, "C:/alumniProject/frontend/public/Images", publicIdentifier);
                            
                            // Stores the information in the Alumni Table
                            Alumni alumni = new Alumni(linkValue, linkedinInfoResponse.body()); // Creates the alumni object with the constructor that needs the linkedinLink and the linkedinInfo
                            addAlumni(alumni);
                        } else {
                            System.out.println("API call failed with status code: " + linkedinInfoResponse.statusCode() + linkedinInfoResponse.body() + " For profile: " + linkValue);
                        }
                    }                    
                } catch (Exception error) {
                    System.out.println("error: " + error);
                }
            }
            System.out.println("Alumni table populated with the API scraped information.");
        } catch (Exception e) {
            throw new RuntimeException("Error processing file", e);
        }
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
    public void getAlumniDistCity(Map<String, Integer> cityAlumniCount) {
        // Accesses the Alumni table and populates the City table
        List<Alumni> alumniList = alumniRepository.findAll();

        // Puts in a map the cites (as keys) and the number of alumni for each city (as value)
        for (Alumni alumni : alumniList) {
            String linkedinInfo = alumni.getLinkedinInfo();
            String city = JsonFileHandler.extractFieldFromJson("city", linkedinInfo);

            // Ensures consistency across fields
            city = city.toLowerCase();
            city = city.replaceAll("ü", "u");
            
            // Update the count for the city in the map
            cityAlumniCount.put(city, cityAlumniCount.getOrDefault(city, 0) + 1);
        }
    } 

    // Gets the alumni distribution per country
    @Override
    public void getAlumniDistCountry(Map<String, Integer> countryAlumniCount, Map<String, String> countryCodes) {
        // Accesses the Alumni table and populates the ViewAlumniCountry table
        List<Alumni> alumniList = alumniRepository.findAll();
        var count = 0;
        // Puts in a map the countries (as keys) and the number of alumni for each country (as value)
        for (Alumni alumni : alumniList) {
            String linkedinInfo = alumni.getLinkedinInfo();
            String country = JsonFileHandler.extractFieldFromJson("country_full_name", linkedinInfo);
            String countryCode = JsonFileHandler.extractFieldFromJson("country", linkedinInfo);
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
