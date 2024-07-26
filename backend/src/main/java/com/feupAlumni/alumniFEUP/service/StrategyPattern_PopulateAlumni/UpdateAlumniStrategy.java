package com.feupAlumni.alumniFEUP.service.StrategyPattern_PopulateAlumni;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.List;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.handlers.AlumniInfo;
import com.feupAlumni.alumniFEUP.handlers.JsonFileHandler;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.service.AdminService;
import com.feupAlumni.alumniFEUP.service.AlumniService;

import org.apache.poi.ss.usermodel.*;


public class UpdateAlumniStrategy implements AlumniStrategy {
    
    private final AlumniService alumniService;
    private final AdminService adminService;

    @Autowired
    public UpdateAlumniStrategy(AlumniService alumniService, AdminService adminService) {
        this.alumniService = alumniService;
        this.adminService = adminService;
    }

    @Override
    public void populateAlumniTable(MultipartFile file, List<String> errorMessages) throws IOException, InterruptedException {
        try (InputStream inputStream = file.getInputStream()){
            // Read the excel file
            Workbook workbook = WorkbookFactory.create(inputStream);
            int sheetReadFrom = Integer.parseInt(JsonFileHandler.getPropertyFromApplicationProperties("excel.sheet").trim());
            Sheet sheet = workbook.getSheetAt(sheetReadFrom);   // selects the sheet to read from
            Iterator<Row> rowIterator = sheet.iterator();

            // Skip the first row which corresponds to header
            for (int i=0; i<1; i++){
                if(rowIterator.hasNext()){
                    rowIterator.next();
                } 
            }

            // Iterate over the excel file
            while (rowIterator.hasNext()) {
                try {
                    Row row = rowIterator.next();

                    // Grabs the linkedin link 
                    int cellForLinkedInLink = Integer.parseInt(JsonFileHandler.getPropertyFromApplicationProperties("excel.rowForLinkedInLink").trim());
                    String linkValue = row.getCell(cellForLinkedInLink).getStringCellValue();                     
                    linkValue = URLDecoder.decode(linkValue, StandardCharsets.UTF_8.toString());
                    Boolean linkedinExists = alumniService.linkedinExists(linkValue);

                    if(linkValue.length()!=0 ){
                        // Get Encrypted the API Key from the DB
                        String apiKeyEncrypted = adminService.getEncryptedApiKey();

                        // Call the API that gets the information of a linkedin profile 
                        var linkedinInfoResponse = AlumniInfo.getLinkedinProfileInfo(linkValue, apiKeyEncrypted);
                        if(linkedinInfoResponse.statusCode() == 200){
                            // Get the profile pic URL
                            JSONObject jsonResponse = new JSONObject(linkedinInfoResponse.body());
                            String profilePicUrl = jsonResponse.optString("profile_pic_url", null); 
                            String publicIdentifier = jsonResponse.optString("public_identifier", null);

                            // downloads and saves the pic in a local folder
                            String savePicFolderPath = JsonFileHandler.getPropertyFromApplicationProperties("apiLinkedin.savePicFolder").trim();
                            AlumniInfo.downloadAndSaveImage(profilePicUrl, savePicFolderPath, publicIdentifier, errorMessages);
                            
                            Alumni alumni;
                            if (linkedinExists) { // needs to update the alumni information
                                alumni = alumniService.findByLinkedinLink(linkValue);
                                alumni.setLinkedinInfo(linkedinInfoResponse.body());
                            } else {
                                alumni = new Alumni(linkValue, linkedinInfoResponse.body());
                            }
                            alumniService.addAlumni(alumni);
                        } else {
                            JSONObject jsonResponse = new JSONObject(linkedinInfoResponse.body());
                            String errorDescription = jsonResponse.optString("description", "No description provided");
                            errorMessages.add("API call failed with status code: " + linkedinInfoResponse.statusCode() + " - " + errorDescription + " For profile: " + linkValue);
                        }
                    }                    
                } catch (Exception error) {
                    System.out.println("error: " + error);
                }
            }
            System.out.println("Alumni table updated with the API scraped information.");
        } catch (Exception e) {
            throw new RuntimeException("Error processing file", e);
        }
    }
}
