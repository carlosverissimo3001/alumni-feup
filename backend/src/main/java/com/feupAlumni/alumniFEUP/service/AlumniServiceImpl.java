package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.handlers.CleanData;
import com.feupAlumni.alumniFEUP.handlers.AlumniInfo;
import com.feupAlumni.alumniFEUP.handlers.FilesHandler;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.model.Course;
import com.feupAlumni.alumniFEUP.model.City;
import com.feupAlumni.alumniFEUP.model.Country;
import com.feupAlumni.alumniFEUP.model.AlumniBackup;
import com.feupAlumni.alumniFEUP.model.AlumniEic;
import com.feupAlumni.alumniFEUP.model.AlumniEic_has_Course;
import com.feupAlumni.alumniFEUP.repository.AlumniBackupRepository;
import com.feupAlumni.alumniFEUP.repository.AlumniEicHasCourseRepository;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;
import com.feupAlumni.alumniFEUP.repository.AlumniEicRepository;
import com.feupAlumni.alumniFEUP.repository.CourseRepository;
import com.feupAlumni.alumniFEUP.repository.CityRepository;
import com.feupAlumni.alumniFEUP.repository.CountryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.Iterator;
import java.util.HashMap;
import java.util.Map;
import org.apache.poi.ss.usermodel.*;


@Service
public class AlumniServiceImpl implements AlumniService{

    @Autowired
    private AlumniRepository alumniRepository;
    @Autowired
    private AlumniEicRepository alumniEicRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private AlumniEicHasCourseRepository alumniEic_has_CourseRepository;
    @Autowired
    private AlumniBackupRepository alumniBackupRepository;
    @Autowired
    private CityRepository cityRepository;
    @Autowired
    private CountryRepository countryRepository;

    int contagem = 0; 

    private boolean linkedinExists(String linkValue) {
        return alumniRepository.existsByLinkedinLink(linkValue);
    }   

    private boolean courseExists(String course) {
        return courseRepository.existsByAbbreviation(course);
    }
                                      
    @Override
    public void populateAlumniTable(MultipartFile file) throws IOException, InterruptedException {
        // TODO: commented so I don't call the API by accident
        
        /*try (InputStream inputStream = file.getInputStream()){
            // Read and iterate over the excel file
            Workbook workbook = WorkbookFactory.create(inputStream);
            Sheet sheet = workbook.getSheetAt(1);   // 2nd sheet
            Iterator<Row> rowIterator = sheet.iterator();

            // Skip the first two rows
            for (int i=0; i<2; i++){
                if(rowIterator.hasNext()){
                    rowIterator.next();
                } 
            }

            while (rowIterator.hasNext()) {
                try {
                    Row row = rowIterator.next();

                    String linkValue = row.getCell(8).getStringCellValue();                     
                    linkValue = URLDecoder.decode(linkValue, StandardCharsets.UTF_8.toString());

                    // Sees if the linkedin link exists in the tabel
                    Boolean linkedinExists = linkedinExists(linkValue);

                    // If the linkedin doesn't exist - calls the API and: adds to the table
                    //                                                    adds to the file for personal backup
                    //                                                    stores the image profile in a local folder (this because the API only makes the URL available for 30 min)
                    // The images is stored in the path: "C:/alimniProject/backend/src/main/java/com/feupAlumni/alumniFEUP/Images"
                    // The name of the image is set to the profile identifier
                    if(!linkedinExists && linkValue.length()!=0 ){
                        System.out.println("---- " + linkValue);

                        // Call the API that gets the information of a linkedin profile 
                        var linkedinInfoResponse = AlumniInfo.getLinkedinProfileInfo(linkValue);

                        if(linkedinInfoResponse.statusCode() == 200){
                            // Get the profile pic URL
                            JSONObject jsonResponse = new JSONObject(linkedinInfoResponse.body());
                            String profilePicUrl = jsonResponse.optString("profile_pic_url", null); 
                            String publicIdentifier = jsonResponse.optString("public_identifier", null);

                            // downloads and saves the pic in a local folder
                            String savedImagePath = AlumniInfo.downloadAndSaveImage(profilePicUrl, "C:/alimniProject/frontend/public/Images", publicIdentifier);
                            System.out.println("Saved to path: " + savedImagePath);

                            // Stores the result in a file for personal backup. If the file exists, adds to the content
                            String filePath = "C:/Users/jenif/OneDrive/Área de Trabalho/BackUpCallAPI";
                            FilesHandler.storeInfoInFile(linkedinInfoResponse.body(), filePath);
                            
                            // Stores the information in the database
                            Alumni alumni = new Alumni(linkValue, linkedinInfoResponse.body()); // Creates the alumni object with the constructor that needs the linkedinLink and the linkedinInfo
                            alumniRepository.save(alumni);
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
        }*/
    }

    @Override
    public void backupAlumniTable() {
        System.out.println("-----");
        // Check if AlumniBackup table is not empty
        if (alumniBackupRepository.count() > 0) {   
            System.out.println("Table AlumniBackup populated. Registers are going to be deteled!");
            alumniBackupRepository.deleteAll();
        }

        // Fetch all alumnis
        List<Alumni> alumnis = alumniRepository.findAll();

        if(alumnis.isEmpty()) {
            System.out.println("Procedure interrupted: alumni table is empty.");
            System.out.println("-----");
            return;
        }

        // Iterate through alumnis and add them to alumnibackup table
        for (Alumni alumni : alumnis) {
            AlumniBackup alumniBackup = new AlumniBackup(alumni.getLinkedinLink(), alumni.getLinkedinInfo());
            alumniBackupRepository.save(alumniBackup);
        }
        System.out.println("Table AlumniBackup repopulated.");
        System.out.println("-----");
    }

    @Override
    public void processFileBackup(MultipartFile fileBackup) {
        CleanData.cleanTable(alumniRepository);
        try (InputStream inputStream = fileBackup.getInputStream()){
            String fileBackupContent = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);

            String startPattern = "{\"public_identifier\":";
            String endPattern = "]}";

            // first occurance of the start pattern
            int startIndex = fileBackupContent.indexOf(startPattern);

            while (startIndex != -1) {
                // find the next occurrence of the end pattern after the start index
                int endIndex = fileBackupContent.indexOf(endPattern, startIndex + 1);

                if(endIndex != -1){
                    // extract the content between the start and the end patterns
                    String linkedinContent = fileBackupContent.substring(startIndex, endIndex + 2);

                    // Creates the alumni object with the constructor that needs the linkedinInfo
                    Alumni alumni = new Alumni(linkedinContent);

                    // Stores the information in the database
                    alumniRepository.save(alumni);

                    // Find the next occurrence of the start pattern after the end index
                    startIndex = fileBackupContent.indexOf(startPattern, endIndex + 1);
                } else {
                    break;
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error processing file backup", e);
        }
        
        System.out.println("Table Alumni repopulated.");
        System.out.println("-----");
    }

    @Override
    public void missingLinkedinLinks() {
        List<Alumni> alumniList = alumniRepository.findAll();
        for (Alumni alumni : alumniList) {
            String linkedinLink = alumni.getLinkedinLink();
            if (linkedinLink == null) {
                String linkedinInfo = alumni.getLinkedinInfo();
                String publicIdentifier = FilesHandler.extractFieldFromJson("public_identifier", linkedinInfo);
                String linkedinLinkNew = "https://www.linkedin.com/in/" + publicIdentifier + "/";

                alumni.setLinkedinLink(linkedinLinkNew);
                alumniRepository.save(alumni);
            }
        }
    }

    @Override
    public void populateAlumniEic(MultipartFile file) {
        // Clean AlumniEIC Table
        CleanData.cleanTable(alumniEicRepository);

        // Clean AlumniEIC_has_Courses Table
        CleanData.cleanTable(alumniEic_has_CourseRepository);

        // Goes through the Excel file
        try (InputStream inputStream = file.getInputStream()){
            // Read and iterate over the excel file
            Workbook workbook = WorkbookFactory.create(inputStream);
            Sheet sheet = workbook.getSheetAt(1);   // 2nd sheet
            Iterator<Row> rowIterator = sheet.iterator();

            // Skip the first two rows
            for (int i=0; i<2; i++){
                if(rowIterator.hasNext()){
                    rowIterator.next();
                } 
            }

            while (rowIterator.hasNext()) {
                // Reads the linkedin links of the current row
                Row row = rowIterator.next();
                String linkedinLinkBefore = row.getCell(4).getStringCellValue();
                String linkedinLinkAfter = row.getCell(8).getStringCellValue();
                if((!linkedinLinkBefore.isEmpty() || !linkedinLinkAfter.isEmpty())){
                    // Gets the alumni with the specific linkedinLink
                    Alumni alumniWithLinkedinLink = alumniRepository.findByLinkedinLink(linkedinLinkBefore);
                    if(alumniWithLinkedinLink==null) { // If "linkedinLinkBefore" was not found because it's empty, for example, it trys the other one
                        alumniWithLinkedinLink = alumniRepository.findByLinkedinLink(linkedinLinkAfter);
                    }
                    if(alumniWithLinkedinLink!=null) { 
                        // From the Alumni table in the DB: full name, linkedin link, country name, and city name
                        String linkedinInfo = alumniWithLinkedinLink.getLinkedinInfo();
                        String alumniFirstName = FilesHandler.extractFieldFromJson("first_name", linkedinInfo);
                        String alumniLastName = FilesHandler.extractFieldFromJson("last_name", linkedinInfo);
                        String alumniFullName = alumniFirstName + " " + alumniLastName;
                        String linkedinLink = "https://www.linkedin.com/in/"+ FilesHandler.extractFieldFromJson("public_identifier", linkedinInfo) + "/";
                        String countryName = FilesHandler.extractFieldFromJson("country_full_name", linkedinInfo);
                        String cityName = FilesHandler.extractFieldFromJson("city", linkedinInfo);
                        
                        City city = cityRepository.findByCity(cityName);
                        Country country = countryRepository.findByCountry(countryName);

                        // From the Excel: gets the courses and years of conclusion
                        String courses = row.getCell(9).getStringCellValue();
                        String[] coursesArray = courses.split(" ");
                        Map<Course, String> courseYearMap = new HashMap<>();
                        
                        for (String course : coursesArray) {
                            String yearConclusion = "";
                            Course courseMap;
                            switch (course) {
                                case "LEIC":
                                    yearConclusion = row.getCell(11).getStringCellValue();
                                    break;
                                case "MEI":
                                    yearConclusion = row.getCell(13).getStringCellValue();
                                    break;
                                case "MIEIC":
                                    yearConclusion = row.getCell(15).getStringCellValue();
                                    break;
                                case "L.EIC":
                                    yearConclusion = row.getCell(17).getStringCellValue();
                                    break;
                                case "M.EIC":
                                    yearConclusion = row.getCell(19).getStringCellValue();
                                    break;
                                default:
                                    break;
                            }
                            courseMap = courseRepository.findByAbbreviation(course);
                            courseYearMap.put(courseMap, yearConclusion);
                        }
                        // Saves the alumni in the DB
                        AlumniEic alumniEic = new AlumniEic(alumniFullName, linkedinLink, city, country);
                        alumniEicRepository.save(alumniEic);
                        for (Course course : courseYearMap.keySet()) {
                            String yearOfConclusion = courseYearMap.get(course);
                            AlumniEic_has_Course alumniEicHasCourse = new AlumniEic_has_Course(alumniEic, course, yearOfConclusion);
                            alumniEic_has_CourseRepository.save(alumniEicHasCourse);
                        }
                    }
                }
            }
            System.out.println("AlumniEIC table re-populated");
            System.out.println("-----");
        } catch(Exception e) {
            System.out.println("Error !!!!: " + e);
        }
    }

    @Override
    public void populateCoursesTable(MultipartFile file) {
        // Clean Courses table
        CleanData.cleanTable(courseRepository);

        // Clean AlumniEIC_has_Courses Table
        CleanData.cleanTable(alumniEic_has_CourseRepository);

        // Goes through the excel file
        try (InputStream inputStream = file.getInputStream()){
            // Read and iterate over the excel file
            Workbook workbook = WorkbookFactory.create(inputStream);
            Sheet sheet = workbook.getSheetAt(1);   // 2nd sheet
            Iterator<Row> rowIterator = sheet.iterator();

            // Skip the first two rows
            for (int i=0; i<2; i++){
                if(rowIterator.hasNext()){
                    rowIterator.next();
                } 
            }

            while (rowIterator.hasNext()) {
                try {
                    // Reads the course of the current row
                    Row row = rowIterator.next();
                    String courses = row.getCell(9).getStringCellValue();
                    String[] coursesArray = courses.split(" ");
                    
                    for (String course : coursesArray) {
                        // Sees if the course exists in the table
                        Boolean courseExists = courseExists(course);
                        if(!courseExists){
                            System.out.println("----" + course);
                            // Stores the information in the DB
                            Course courseDb = new Course(course);
                            courseRepository.save(courseDb);
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
}
