package com.feupAlumni.alumniFEUP.handlers;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class FilesHandler {
    
    // Stores infromation in a given file
    public static void storeInfoInFile(String information, String filePath) {
        try (FileWriter writer = new FileWriter(filePath, true)) {
            writer.write(information);
            writer.write(System.lineSeparator()); // Add a new line for each entry
        } catch (IOException e) {
            System.out.println("Error storing result in file: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // If the file exists => delete 
    public static void fileDeletion(File file) {
        if(file.exists()){
            if (file.delete()) {
                System.out.println("Deleted existing file.");
            } else {
                System.err.println("Failed to delete existing file.");
            }
        }
    } 

    // Extracts the value of a given NOT nested field of a json
    public static String extractFieldFromJson(String fieldToExtract, String jsonData) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonData);
            JsonNode fieldNode = jsonNode.get(fieldToExtract);
            if (fieldNode != null) {
                if (fieldNode.isArray()) {
                    ArrayNode arrayNode = (ArrayNode) fieldNode;
                    List<String> values = new ArrayList<>();
                    for (JsonNode node : arrayNode) {
                        values.add(node.asText());
                    }
                    return String.join(", ", values); // Join array elements with a delimiter
                } else {
                    return fieldNode.asText(); // non array case
                }
            } else {
                return ""; // field doesn't exist
            }


        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
    
    // Extracts nested field unitl 1 level 
    private static String extractOneLevelNestedFiled(JsonNode jsonNode, String fieldToExtract, String nestedFrom) {
        JsonNode fieldNode = jsonNode.get(fieldToExtract);

        if (fieldNode != null) { 
            return fieldNode.asText();
        } else {
            // Handle nested structures untill 1 level
            JsonNode nestedNode = jsonNode.get(nestedFrom);
            if (nestedNode != null) {
                return extractOneLevelNestedFiled(nestedNode, fieldToExtract, null);
            }
            return null;
        }
    }

    // Returns the fields of the experience field
    public static List<ObjectNode> getExperienceDetails(String jsonData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(jsonData);

            JsonNode experiences = jsonNode.get("experiences");
            List<ObjectNode> resultNodesList = new ArrayList<>();
            if (experiences != null && experiences.isArray()) {
                for (JsonNode experience : experiences) {
                    String yearStartDay = extractOneLevelNestedFiled(experience, "day", "starts_at");
                    String yearStartMonth = extractOneLevelNestedFiled(experience, "month", "starts_at");
                    String yearStartYear = extractOneLevelNestedFiled(experience, "year", "starts_at");

                    String yearEndDay = extractOneLevelNestedFiled(experience, "day", "ends_at");
                    String yearEndMonth = extractOneLevelNestedFiled(experience, "month", "ends_at");
                    String yearEndYear = extractOneLevelNestedFiled(experience, "year", "ends_at");

                    String time = yearStartDay + "/" + yearStartMonth + "/" + yearStartYear + " - " + yearEndDay + "/" + yearEndMonth + "/" + yearEndYear;
                    String company = extractOneLevelNestedFiled(experience, "company", null);
                    String company_linkedin_profile_url = extractOneLevelNestedFiled(experience, "company_linkedin_profile_url", null);
                    String title = extractOneLevelNestedFiled(experience, "title", null);
                    String description = extractOneLevelNestedFiled(experience, "description", null);
                    String location = extractOneLevelNestedFiled(experience, "location", null);
                    String logo_url = extractOneLevelNestedFiled(experience, "logo_url", null);

                    ObjectNode resultNode = objectMapper.createObjectNode();
                    resultNode.put("time", time);
                    resultNode.put("company", company);
                    resultNode.put("company_linkedin_profile_url", company_linkedin_profile_url);
                    resultNode.put("title", title);
                    resultNode.put("description", description);
                    resultNode.put("location", location);
                    resultNode.put("logo_url", logo_url);

                    resultNodesList.add(resultNode);
                }
            }
            return resultNodesList;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static List<ObjectNode> getEducationDetails(String jsonData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(jsonData);

            JsonNode educations = jsonNode.get("education");
            List<ObjectNode> resultNodesList = new ArrayList<>();
            if (educations != null && educations.isArray()) {
                for (JsonNode education : educations) {
                    String yearStartDay = extractOneLevelNestedFiled(education, "day", "starts_at");
                    String yearStartMonth = extractOneLevelNestedFiled(education, "month", "starts_at");
                    String yearStartYear = extractOneLevelNestedFiled(education, "year", "starts_at");

                    String yearEndDay = extractOneLevelNestedFiled(education, "day", "ends_at");
                    String yearEndMonth = extractOneLevelNestedFiled(education, "month", "ends_at");
                    String yearEndYear = extractOneLevelNestedFiled(education, "year", "ends_at");

                    String time = yearStartDay + "/" + yearStartMonth + "/" + yearStartYear + " - " + yearEndDay + "/" + yearEndMonth + "/" + yearEndYear;
                    String fieldOfStudy = extractOneLevelNestedFiled(education, "field_of_study", null);
                    String degreeName = extractOneLevelNestedFiled(education, "degree_name", null);
                    String school = extractOneLevelNestedFiled(education, "school", null);
                    String schoolLinkedinProfileUrl = extractOneLevelNestedFiled(education, "school_linkedin_profile_url", null);
                    String description = extractOneLevelNestedFiled(education, "description", null);
                    String logoUrl = extractOneLevelNestedFiled(education, "logo_url", null);
                    String grade = extractOneLevelNestedFiled(education, "grade", null);
                    String activitiesAndSocieties = extractOneLevelNestedFiled(education, "activities_and_societies", null);

                    ObjectNode resultNode = objectMapper.createObjectNode();
                    resultNode.put("time", time);
                    resultNode.put("field_of_study", fieldOfStudy);
                    resultNode.put("degree_name", degreeName);
                    resultNode.put("school", school);
                    resultNode.put("school_linkedin_profile_url", schoolLinkedinProfileUrl);
                    resultNode.put("description", description);
                    resultNode.put("logo_url", logoUrl);
                    resultNode.put("grade", grade);
                    resultNode.put("activities_and_societies", activitiesAndSocieties);


                    resultNodesList.add(resultNode);
                }
            }
            return resultNodesList;

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static List<ObjectNode> getAccompOrganisationsDetails (String jsonData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(jsonData);

            JsonNode accompOrganisations = jsonNode.get("accomplishment_organisations");
            List<ObjectNode> resultNodesList = new ArrayList<>();
            if (accompOrganisations != null && accompOrganisations.isArray()) {
                for (JsonNode accompOrganisation : accompOrganisations) {
                    String yearStartDay = extractOneLevelNestedFiled(accompOrganisation, "day", "starts_at");
                    String yearStartMonth = extractOneLevelNestedFiled(accompOrganisation, "month", "starts_at");
                    String yearStartYear = extractOneLevelNestedFiled(accompOrganisation, "year", "starts_at");

                    String yearEndDay = extractOneLevelNestedFiled(accompOrganisation, "day", "ends_at");
                    String yearEndMonth = extractOneLevelNestedFiled(accompOrganisation, "month", "ends_at");
                    String yearEndYear = extractOneLevelNestedFiled(accompOrganisation, "year", "ends_at");

                    String time = yearStartDay + "/" + yearStartMonth + "/" + yearStartYear + " - " + yearEndDay + "/" + yearEndMonth + "/" + yearEndYear;
                    String orgName = extractOneLevelNestedFiled(accompOrganisation, "org_name", null);
                    String title = extractOneLevelNestedFiled(accompOrganisation, "title", null);
                    String description = extractOneLevelNestedFiled(accompOrganisation, "description", null);

                    ObjectNode resultNode = objectMapper.createObjectNode();
                    resultNode.put("time", time);
                    resultNode.put("org_name", orgName);
                    resultNode.put("title", title);
                    resultNode.put("description", description);

                    resultNodesList.add(resultNode);
                }
            }
            return resultNodesList;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static List<ObjectNode> getAccompPublicationsDetails (String jsonData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(jsonData);

            JsonNode accompPublications = jsonNode.get("accomplishment_publications");
            List<ObjectNode> resultNodesList = new ArrayList<>();
            if (accompPublications != null && accompPublications.isArray()) {
                for (JsonNode accompPublication : accompPublications) { 
                    String dayPublished = extractOneLevelNestedFiled(accompPublication, "day", "published_on");
                    String monthPublished = extractOneLevelNestedFiled(accompPublication, "month", "published_on");
                    String yearPublished = extractOneLevelNestedFiled(accompPublication, "year", "published_on");
                    
                    String name = extractOneLevelNestedFiled(accompPublication, "name", null);
                    String publisher = extractOneLevelNestedFiled(accompPublication, "publisher", null);
                    String publishedOn = dayPublished + "/" + monthPublished + "/" + yearPublished;
                    String description = extractOneLevelNestedFiled(accompPublication, "description", null);
                    String url = extractOneLevelNestedFiled(accompPublication, "url", null);
                    
                    ObjectNode resultNode = objectMapper.createObjectNode();
                    resultNode.put("name", name);
                    resultNode.put("publisher", publisher);
                    resultNode.put("published_on", publishedOn);
                    resultNode.put("description", description);
                    resultNode.put("url", url);
    
                    resultNodesList.add(resultNode);
                }
            }
            return resultNodesList;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static List<ObjectNode> getAccompHonorsAwardsDetails (String jsonData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(jsonData);

            JsonNode accompHonorsAwards = jsonNode.get("accomplishment_honors_awards");
            List<ObjectNode> resultNodesList = new ArrayList<>();
            if (accompHonorsAwards != null && accompHonorsAwards.isArray()) {
                for (JsonNode accompHnorAward : accompHonorsAwards) { 
                    String dayIssuedOn = extractOneLevelNestedFiled(accompHnorAward, "day", "issued_on");
                    String monthIssuedOn = extractOneLevelNestedFiled(accompHnorAward, "month", "issued_on");
                    String yearIssuedOn = extractOneLevelNestedFiled(accompHnorAward, "year", "issued_on");
                    
                    String title = extractOneLevelNestedFiled(accompHnorAward, "title", null);
                    String issuer = extractOneLevelNestedFiled(accompHnorAward, "issuer", null);
                    String issuedOn = dayIssuedOn + "/" + monthIssuedOn + "/" + yearIssuedOn;
                    String description = extractOneLevelNestedFiled(accompHnorAward, "description", null);
                    
                    ObjectNode resultNode = objectMapper.createObjectNode();
                    resultNode.put("title", title);
                    resultNode.put("issuer", issuer);
                    resultNode.put("issued_on", issuedOn);
                    resultNode.put("description", description);
    
                    resultNodesList.add(resultNode);
                }
            }
            return resultNodesList;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static List<ObjectNode> getAccompPatentsDetails (String jsonData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(jsonData);

            JsonNode accompPattents = jsonNode.get("accomplishment_patents");
            List<ObjectNode> resultNodesList = new ArrayList<>();
            if (accompPattents != null && accompPattents.isArray()) {
                for (JsonNode accompPattent : accompPattents) { 
                    String dayIssuedOn = extractOneLevelNestedFiled(accompPattent, "day", "issued_on");
                    String monthIssuedOn = extractOneLevelNestedFiled(accompPattent, "month", "issued_on");
                    String yearIssuedOn = extractOneLevelNestedFiled(accompPattent, "year", "issued_on");
                    
                    String title = extractOneLevelNestedFiled(accompPattent, "title", null);
                    String issuer = extractOneLevelNestedFiled(accompPattent, "issuer", null);
                    String issuedOn = dayIssuedOn + "/" + monthIssuedOn + "/" + yearIssuedOn;
                    String description = extractOneLevelNestedFiled(accompPattent, "description", null);
                    String applicationNumber = extractOneLevelNestedFiled(accompPattent, "application_number", null);
                    String patentNumber = extractOneLevelNestedFiled(accompPattent, "patent_number", null);
                    String url = extractOneLevelNestedFiled(accompPattent, "url", null);

                    ObjectNode resultNode = objectMapper.createObjectNode();
                    resultNode.put("title", title);
                    resultNode.put("issuer", issuer);
                    resultNode.put("issued_on", issuedOn);
                    resultNode.put("description", description);
                    resultNode.put("application_number", applicationNumber);
                    resultNode.put("patent_number", patentNumber);
                    resultNode.put("url", url);
    
                    resultNodesList.add(resultNode);
                }
            }
            return resultNodesList;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static List<ObjectNode> getAccompCoursesDetails (String jsonData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(jsonData);

            JsonNode accompCourses = jsonNode.get("accomplishment_courses");
            List<ObjectNode> resultNodesList = new ArrayList<>();
            if (accompCourses != null && accompCourses.isArray()) {
                for (JsonNode accompCourse : accompCourses) {                    
                    String name = extractOneLevelNestedFiled(accompCourse, "name", null);
                    String number = extractOneLevelNestedFiled(accompCourse, "number", null);
                    ObjectNode resultNode = objectMapper.createObjectNode();
                    resultNode.put("name", name);
                    resultNode.put("number", number);
                    resultNodesList.add(resultNode);
                }
            }
            return resultNodesList;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static List<ObjectNode> getAccompProjectsDetails (String jsonData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(jsonData);

            JsonNode accompProjects = jsonNode.get("accomplishment_projects");
            List<ObjectNode> resultNodesList = new ArrayList<>();
            if (accompProjects != null && accompProjects.isArray()) {
                for (JsonNode accompProject : accompProjects) {             
                    String dayStart = extractOneLevelNestedFiled(accompProject, "day", "starts_at");
                    String monthStart = extractOneLevelNestedFiled(accompProject, "month", "starts_at");
                    String yearStart = extractOneLevelNestedFiled(accompProject, "year", "starts_at");

                    String dayEnd = extractOneLevelNestedFiled(accompProject, "day", "ends_at");
                    String monthEnd = extractOneLevelNestedFiled(accompProject, "month", "ends_at");
                    String yearEnd = extractOneLevelNestedFiled(accompProject, "year", "ends_at");
                    
                    String time = dayStart + "/" + monthStart + "/" + yearStart + " - " + dayEnd + "/" + monthEnd + "/" + yearEnd;
                    String title = extractOneLevelNestedFiled(accompProject, "title", null);
                    String description = extractOneLevelNestedFiled(accompProject, "description", null);
                    String url = extractOneLevelNestedFiled(accompProject, "url", null);

                    ObjectNode resultNode = objectMapper.createObjectNode();
                    resultNode.put("time", time);
                    resultNode.put("title", title);
                    resultNode.put("description", description);
                    resultNode.put("url", url);
                    resultNodesList.add(resultNode);
                }
            }
            return resultNodesList;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static List<ObjectNode> getAccompTestScoresDetails (String jsonData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(jsonData);

            JsonNode accompTestScores = jsonNode.get("accomplishment_test_scores");
            List<ObjectNode> resultNodesList = new ArrayList<>();
            if (accompTestScores != null && accompTestScores.isArray()) {
                for (JsonNode accompTestScore : accompTestScores) {             
                    String dateOnDay = extractOneLevelNestedFiled(accompTestScore, "day", "date_on");
                    String dateOnMonth = extractOneLevelNestedFiled(accompTestScore, "month", "date_on");
                    String dateOnYear = extractOneLevelNestedFiled(accompTestScore, "year", "date_on");

                    String name = extractOneLevelNestedFiled(accompTestScore, "name", null);
                    String score = extractOneLevelNestedFiled(accompTestScore, "score", null);
                    String dateOn = dateOnDay + "/" + dateOnMonth + "/" + dateOnYear;
                    String description = extractOneLevelNestedFiled(accompTestScore, "description", null);

                    ObjectNode resultNode = objectMapper.createObjectNode();
                    resultNode.put("name", name);
                    resultNode.put("score", score);
                    resultNode.put("date_on", dateOn);
                    resultNode.put("description", description);
                    resultNodesList.add(resultNode);
                }
            }
            return resultNodesList;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static List<ObjectNode> getVolunterWorksDetails (String jsonData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(jsonData);

            JsonNode accompVolunteerWorks = jsonNode.get("volunteer_work");
            List<ObjectNode> resultNodesList = new ArrayList<>();
            if (accompVolunteerWorks != null && accompVolunteerWorks.isArray()) {
                for (JsonNode accompVolunteerWork : accompVolunteerWorks) {             
                    String startDay = extractOneLevelNestedFiled(accompVolunteerWork, "day", "starts_at");
                    String startMonth = extractOneLevelNestedFiled(accompVolunteerWork, "month", "starts_at");
                    String startYear = extractOneLevelNestedFiled(accompVolunteerWork, "year", "starts_at");

                    String endDay = extractOneLevelNestedFiled(accompVolunteerWork, "day", "ends_at");
                    String endMonth = extractOneLevelNestedFiled(accompVolunteerWork, "month", "ends_at");
                    String endYear = extractOneLevelNestedFiled(accompVolunteerWork, "year", "ends_at");

                    String time = startDay + "/" + startMonth + "/" + startYear + " - " + endDay + "/" + endMonth + "/" + endYear;
                    String title = extractOneLevelNestedFiled(accompVolunteerWork, "title", null);
                    String cause = extractOneLevelNestedFiled(accompVolunteerWork, "cause", null);
                    String company = extractOneLevelNestedFiled(accompVolunteerWork, "company", null);
                    String companyLinkedinProfileUrl = extractOneLevelNestedFiled(accompVolunteerWork, "company_linkedin_profile_url", null);
                    String description = extractOneLevelNestedFiled(accompVolunteerWork, "description", null);
                    String logoUrl = extractOneLevelNestedFiled(accompVolunteerWork, "logo_url", null);

                    ObjectNode resultNode = objectMapper.createObjectNode();
                    resultNode.put("time", time);
                    resultNode.put("title", title);
                    resultNode.put("cause", cause);
                    resultNode.put("company", company);
                    resultNode.put("company_linkedin_profile_url", companyLinkedinProfileUrl); 
                    resultNode.put("description", description);
                    resultNode.put("logo_url", logoUrl);

                    resultNodesList.add(resultNode);
                }
            }
            return resultNodesList;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static List<ObjectNode> getCertificationsDetails (String jsonData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(jsonData);

            JsonNode certifications = jsonNode.get("certifications");
            List<ObjectNode> resultNodesList = new ArrayList<>();
            if (certifications != null && certifications.isArray()) {
                for (JsonNode certification : certifications) {             
                    String startDay = extractOneLevelNestedFiled(certification, "day", "starts_at");
                    String startMonth = extractOneLevelNestedFiled(certification, "month", "starts_at");
                    String startYear = extractOneLevelNestedFiled(certification, "year", "starts_at");

                    String endDay = extractOneLevelNestedFiled(certification, "day", "ends_at");
                    String endMonth = extractOneLevelNestedFiled(certification, "month", "ends_at");
                    String endYear = extractOneLevelNestedFiled(certification, "year", "ends_at");

                    String time = startDay + "/" + startMonth + "/" + startYear + " - " + endDay + "/" + endMonth + "/" + endYear;
                    String name = extractOneLevelNestedFiled(certification, "name", null);
                    String licenseNumber = extractOneLevelNestedFiled(certification, "license_number", null);
                    String displaySource = extractOneLevelNestedFiled(certification, "display_source", null);
                    String authority = extractOneLevelNestedFiled(certification, "authority", null);
                    String url = extractOneLevelNestedFiled(certification, "url", null);

                    ObjectNode resultNode = objectMapper.createObjectNode();
                    resultNode.put("time", time);
                    resultNode.put("name", name);
                    resultNode.put("license_number", licenseNumber);
                    resultNode.put("display_source", displaySource);
                    resultNode.put("authority", authority); 
                    resultNode.put("url", url);

                    resultNodesList.add(resultNode);
                }
            }
            return resultNodesList;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    // Returns the fields of the education field
    public static JsonNode getAlumniEducationDetailsOfFeup(String jsonData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(jsonData);

            JsonNode educations = jsonNode.get("education");
            if (educations != null && educations.isArray()) {
                for (JsonNode education : educations) {
                    String schoolName = extractOneLevelNestedFiled(education, "school", null);
                    if (CleanData.isValidSchool(schoolName)) {
                        String degreeName = extractOneLevelNestedFiled(education, "degree_name", null);
                        String fieldOfStudy = extractOneLevelNestedFiled(education, "field_of_study", null);
                        String yearStart = extractOneLevelNestedFiled(education, "year", "starts_at");
                        String yearEnd = extractOneLevelNestedFiled(education, "year", "ends_at");

                        if (degreeName != null && fieldOfStudy != null) {
                            ObjectNode resultNode = objectMapper.createObjectNode();
                            resultNode.put("schoolName", schoolName);
                            resultNode.put("degreeName", degreeName);
                            resultNode.put("fieldOfStudy", fieldOfStudy);
                            resultNode.put("yearStart", yearStart);
                            resultNode.put("yearEnd", yearEnd);
                            
                            return resultNode;
                        }
                    }
                }
            }
            return null;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
