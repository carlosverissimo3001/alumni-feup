package com.feupAlumni.alumniFEUP.service.StrategyPattern_PopulateAlumni;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.handlers.AlumniInfo;
import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.service.AdminService;
import com.feupAlumni.alumniFEUP.service.AlumniService;

import org.apache.poi.ss.usermodel.*;


public class UpdateAlumniStrategy implements AlumniStrategy {
    
    @Autowired
    private AlumniService alumniService;
    @Autowired
    private AdminService adminService;

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
                            AlumniInfo.downloadAndSaveImage(profilePicUrl, "C:/alumniProject/frontend/public/Images", publicIdentifier);
                            
                            Alumni alumni;
                            if (linkedinExists) { // needs to update the alumni information
                                alumni = alumniService.findByLinkedinLink(linkValue);
                                alumni.setLinkedinInfo(linkedinInfoResponse.body());
                            } else {
                                alumni = new Alumni(linkValue, linkedinInfoResponse.body());
                            }
                            alumniService.addAlumni(alumni);
                        } else {
                            System.out.println("API call failed with status code: " + linkedinInfoResponse.statusCode() + linkedinInfoResponse.body() + " For profile: " + linkValue);
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
