package com.feupAlumni.alumniFEUP.handlers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class ManageApiData {

    public static String[][] getFields() {
        String[][] fields = {
            {"0", "Not_Subtitles","Linkedin Link", "public_identifier", "profile_pic_url", "background_cover_image_url", "first_name", "last_name", "full_name", "follower_count", "occupation", "headline", "summary", "country", "country_full_name", "city", "state"},
            {"0", "Has_Subtitles", "experiences"},
            {"1", "experiences", "time", "company", "company_linkedin_profile_url", "title", "description", "location", "logo_url"},
            {"0", "Has_Subtitles", "education"},
            {"1", "education", "time", "field_of_study", "degree_name", "school", "school_linkedin_profile_url", "description", "logo_url", "grade", "activities_and_societies"},
            {"0", "Not_Subtitles", "languages"},
            {"0", "Has_Subtitles", "accomplishment_organisations"},
            {"1", "accomplishment_organisations", "time", "org_name", "title", "description"},
            {"0", "Has_Subtitles", "accomplishment_publications"},
            {"1", "accomplishment_publications", "name", "publisher", "published_on", "description", "url"},
            {"0", "Has_Subtitles", "accomplishment_honors_awards"},
            {"1", "accomplishment_honors_awards", "title", "issuer", "issued_on", "description"},
            {"0", "Has_Subtitles", "accomplishment_patents"},
            {"1", "accomplishment_patents", "title", "issuer", "issued_on", "description", "application_number", "patent_number", "url"},
            {"0", "Has_Subtitles", "accomplishment_courses"},
            {"1", "accomplishment_courses", "name", "number"},
            {"0", "Has_Subtitles", "accomplishment_projects"},
            {"1", "accomplishment_projects", "time", "title", "description", "url"},
            {"0", "Has_Subtitles", "accomplishment_test_scores"},
            {"1", "accomplishment_test_scores", "name", "score", "date_on", "description"},
            {"0", "Has_Subtitles", "volunteer_work"},
            {"1", "volunteer_work", "time", "title", "cause", "company", "company_linkedin_profile_url", "description", "logo_url"},
            {"0", "Has_Subtitles", "certifications"},
            {"1", "certifications", "time", "name", "license_number", "display_source", "authority", "url"},
            {"0", "Not_Subtitles", "connections"},
            {"0", "Has_Subtitles", "people_also_viewed"}, 
            {"1", "people_also_viewed", "link", "name", "summary", "location"},
            {"0", "Not_Subtitles", "recommendations"},
            {"0", "Has_Subtitles", "activities"},
            {"1", "activities", "title", "link", "activity_status"},
            {"0", "Has_Subtitles", "similarly_named_profiles"},
            {"1", "similarly_named_profiles", "name", "link", "summary", "location"},
            {"0", "Has_Subtitles", "articles"},
            {"1", "articles", "title", "link", "published_date", "author", "image_url"},
            {"0", "Has_Subtitles", "groups"},
            {"1", "groups", "profile_pic_url", "name", "url"},
            {"0", "Not_Subtitles", "skills", "inferred_salary", "gender", "birth_date", "industry", "extra", "interests", "personal_emails", "personal_numbers"}
        };
        return fields;
    }

    public static List<ObjectNode> getValuesSubtitles (String fieldName, String jsonData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(jsonData);

            JsonNode fieldNameFromJson = jsonNode.get(fieldName);
            List<ObjectNode> valuesFieldNameFromJson = getValuesFieldFromJson(fieldName, fieldNameFromJson, objectMapper);
            
            return valuesFieldNameFromJson;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    private static List<ObjectNode> getValuesFieldFromJson (String fieldName, JsonNode fieldNameFromJson, ObjectMapper objectMapper) {
        List<ObjectNode> valuesFieldNameFromJson = null;
        switch (fieldName) {
            case "experiences":
            valuesFieldNameFromJson = getValuesExperiences(fieldNameFromJson, objectMapper);
            break;
            case "education":
            valuesFieldNameFromJson = getValuesEducation(fieldNameFromJson, objectMapper);
            break;
            case "accomplishment_organisations":
            valuesFieldNameFromJson = getValuesAccomplishmentOrganisations(fieldNameFromJson, objectMapper);
            break;
            case "accomplishment_publications":
            valuesFieldNameFromJson = getValuesAccomplishmentPublications(fieldNameFromJson, objectMapper);
            break;
            case "accomplishment_honors_awards":
            valuesFieldNameFromJson = getValuesAccomplishmentHonorsAwards(fieldNameFromJson, objectMapper);
            break;
            case "accomplishment_patents":
            valuesFieldNameFromJson = getValuesAccomplishmentPatents(fieldNameFromJson, objectMapper);
            break;
            case "accomplishment_courses":
            valuesFieldNameFromJson = getValuesAccomplishmentCourses(fieldNameFromJson, objectMapper);
            break;
            case "accomplishment_projects":
            valuesFieldNameFromJson = getValuesAccomplishmentProjects(fieldNameFromJson, objectMapper);
            break;
            case "accomplishment_test_scores":
            valuesFieldNameFromJson = getValuesAccomplishmentTestScores(fieldNameFromJson, objectMapper);
            break;
            case "volunteer_work":
            valuesFieldNameFromJson = getValuesVolunteerWork(fieldNameFromJson, objectMapper);
            break;
            case "certifications":
            valuesFieldNameFromJson = getValuesCertifications(fieldNameFromJson, objectMapper);
            break;
            case "people_also_viewed":
            valuesFieldNameFromJson = getValuesPeopleAlsoViewed(fieldNameFromJson, objectMapper);
            break;
            case "activities":
            valuesFieldNameFromJson = getValuesActivities(fieldNameFromJson, objectMapper);
            break;
            case "similarly_named_profiles":
            valuesFieldNameFromJson = getValuesSimilarlyNamedProfiles(fieldNameFromJson, objectMapper);
            break;
            case "articles":
            valuesFieldNameFromJson = getValuesArticles(fieldNameFromJson, objectMapper);
            break;
            case "groups":
            valuesFieldNameFromJson = getValuesGroups(fieldNameFromJson, objectMapper);
            break;
        }
        return valuesFieldNameFromJson;
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
    private static List<ObjectNode> getValuesExperiences(JsonNode experiences, ObjectMapper objectMapper) {
        ObjectNode resultNode = null;
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

                resultNode = objectMapper.createObjectNode();
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
    }

    private static List<ObjectNode> getValuesEducation(JsonNode educations, ObjectMapper objectMapper) {
        ObjectNode resultNode = null;
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

                resultNode = objectMapper.createObjectNode();
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
    }

    private static List<ObjectNode> getValuesAccomplishmentOrganisations (JsonNode accompOrganisations, ObjectMapper objectMapper) {
        ObjectNode resultNode = null;
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

                resultNode = objectMapper.createObjectNode();
                resultNode.put("time", time);
                resultNode.put("org_name", orgName);
                resultNode.put("title", title);
                resultNode.put("description", description);
                resultNodesList.add(resultNode);
            }
        }
        return resultNodesList;
    }

    private static List<ObjectNode> getValuesAccomplishmentPublications (JsonNode accompPublications, ObjectMapper objectMapper) {
        ObjectNode resultNode = null;
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
                
                resultNode = objectMapper.createObjectNode();
                resultNode.put("name", name);
                resultNode.put("publisher", publisher);
                resultNode.put("published_on", publishedOn);
                resultNode.put("description", description);
                resultNode.put("url", url);
                resultNodesList.add(resultNode);
            }
        }
        return resultNodesList;
        
    }

    private static List<ObjectNode> getValuesAccomplishmentHonorsAwards (JsonNode accompHonorsAwards, ObjectMapper objectMapper) {
        ObjectNode resultNode = null;
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
                
                resultNode = objectMapper.createObjectNode();
                resultNode.put("title", title);
                resultNode.put("issuer", issuer);
                resultNode.put("issued_on", issuedOn);
                resultNode.put("description", description);
                resultNodesList.add(resultNode);
            }
        }
        return resultNodesList;
    }

    private static List<ObjectNode> getValuesAccomplishmentPatents (JsonNode accompPattents, ObjectMapper objectMapper) {
        ObjectNode resultNode = null;
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

                resultNode = objectMapper.createObjectNode();
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
    }

    private static List<ObjectNode> getValuesAccomplishmentCourses (JsonNode accompCourses, ObjectMapper objectMapper) {
        ObjectNode resultNode = null;
        List<ObjectNode> resultNodesList = new ArrayList<>();
        if (accompCourses != null && accompCourses.isArray()) {
            for (JsonNode accompCourse : accompCourses) {                    
                String name = extractOneLevelNestedFiled(accompCourse, "name", null);
                String number = extractOneLevelNestedFiled(accompCourse, "number", null);
                resultNode = objectMapper.createObjectNode();
                resultNode.put("name", name);
                resultNode.put("number", number);
                resultNodesList.add(resultNode);
            }
        }
        return resultNodesList;
    }

    private static List<ObjectNode> getValuesAccomplishmentProjects (JsonNode accompProjects, ObjectMapper objectMapper) {
        ObjectNode resultNode = null;
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

                resultNode = objectMapper.createObjectNode();
                resultNode.put("time", time);
                resultNode.put("title", title);
                resultNode.put("description", description);
                resultNode.put("url", url);
                resultNodesList.add(resultNode);
            }
        }
        return resultNodesList;
    }

    private static List<ObjectNode> getValuesAccomplishmentTestScores (JsonNode accompTestScores, ObjectMapper objectMapper) {
        ObjectNode resultNode = null;
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

                resultNode = objectMapper.createObjectNode();
                resultNode.put("name", name);
                resultNode.put("score", score);
                resultNode.put("date_on", dateOn);
                resultNode.put("description", description);
                resultNodesList.add(resultNode);
            }
        }
        return resultNodesList;     
    }

    private static List<ObjectNode> getValuesVolunteerWork (JsonNode accompVolunteerWorks, ObjectMapper objectMapper) {
        ObjectNode resultNode = null;
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

                resultNode = objectMapper.createObjectNode();
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
    }

    private static List<ObjectNode> getValuesCertifications (JsonNode certifications, ObjectMapper objectMapper) {
        ObjectNode resultNode = null;
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

                resultNode = objectMapper.createObjectNode();
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
    }

    private static List<ObjectNode> getValuesPeopleAlsoViewed (JsonNode peopleAlsoViewed, ObjectMapper objectMapper) {
        ObjectNode resultNode = null;
        List<ObjectNode> resultNodesList = new ArrayList<>();
        if (peopleAlsoViewed != null && peopleAlsoViewed.isArray()) {
            for (JsonNode personAlsoViewed : peopleAlsoViewed) {             
                String link = extractOneLevelNestedFiled(personAlsoViewed, "link", null);
                String name = extractOneLevelNestedFiled(personAlsoViewed, "name", null);
                String summary = extractOneLevelNestedFiled(personAlsoViewed, "summary", null);
                String location = extractOneLevelNestedFiled(personAlsoViewed, "location", null);

                resultNode = objectMapper.createObjectNode();
                resultNode.put("link", link);
                resultNode.put("name", name);
                resultNode.put("summary", summary);
                resultNode.put("location", location);
                resultNodesList.add(resultNode);
            }
        }
        return resultNodesList;
    }

    private static List<ObjectNode> getValuesActivities (JsonNode activities, ObjectMapper objectMapper) {
        ObjectNode resultNode = null;
        List<ObjectNode> resultNodesList = new ArrayList<>();
        if (activities != null && activities.isArray()) {
            for (JsonNode activity : activities) {             
                String title = extractOneLevelNestedFiled(activity, "title", null);
                String link = extractOneLevelNestedFiled(activity, "link", null);
                String activityStatus = extractOneLevelNestedFiled(activity, "activity_status", null);

                resultNode = objectMapper.createObjectNode();
                resultNode.put("title", title);
                resultNode.put("link", link);
                resultNode.put("activity_status", activityStatus);
                resultNodesList.add(resultNode);
            }
        }
        return resultNodesList;
        
    }

    private static List<ObjectNode> getValuesSimilarlyNamedProfiles (JsonNode similarlyNamedProfiles, ObjectMapper objectMapper) {
        ObjectNode resultNode = null;
        List<ObjectNode> resultNodesList = new ArrayList<>();
        if (similarlyNamedProfiles != null && similarlyNamedProfiles.isArray()) {
            for (JsonNode similarlyNamedProfile : similarlyNamedProfiles) {             
                String name = extractOneLevelNestedFiled(similarlyNamedProfile, "name", null);
                String link = extractOneLevelNestedFiled(similarlyNamedProfile, "link", null);
                String summary = extractOneLevelNestedFiled(similarlyNamedProfile, "summary", null);
                String location = extractOneLevelNestedFiled(similarlyNamedProfile, "location", null);

                resultNode = objectMapper.createObjectNode();
                resultNode.put("name", name);
                resultNode.put("link", link);
                resultNode.put("summary", summary);
                resultNode.put("location", location);
                resultNodesList.add(resultNode);
            }
        }
        return resultNodesList;
    }

    private static List<ObjectNode> getValuesArticles (JsonNode articles, ObjectMapper objectMapper) {
        ObjectNode resultNode = null;
        List<ObjectNode> resultNodesList = new ArrayList<>();
        if (articles != null && articles.isArray()) {
            for (JsonNode article : articles) {             
                String publishedDay = extractOneLevelNestedFiled(article, "day", "published_date");
                String publishedMonth = extractOneLevelNestedFiled(article, "month", "published_date");
                String publishedYear = extractOneLevelNestedFiled(article, "year", "published_date");

                String title = extractOneLevelNestedFiled(article, "title", null);
                String link = extractOneLevelNestedFiled(article, "link", null);
                String publishedDate = publishedDay + "/" + publishedMonth + "/" + publishedYear;
                String author = extractOneLevelNestedFiled(article, "author", null);
                String imageUrl = extractOneLevelNestedFiled(article, "image_url", null);

                resultNode = objectMapper.createObjectNode();
                resultNode.put("title", title);
                resultNode.put("link", link);
                resultNode.put("published_date", publishedDate);
                resultNode.put("author", author);
                resultNode.put("image_url", imageUrl);
                resultNodesList.add(resultNode);
            }
        }
        return resultNodesList;
    }

    private static List<ObjectNode> getValuesGroups (JsonNode groups, ObjectMapper objectMapper) {
        ObjectNode resultNode = null;
        List<ObjectNode> resultNodesList = new ArrayList<>();
        if (groups != null && groups.isArray()) {
            for (JsonNode group : groups) {             
                String profilePicUrl = extractOneLevelNestedFiled(group, "profile_pic_url", null);
                String name = extractOneLevelNestedFiled(group, "name", null);
                String url = extractOneLevelNestedFiled(group, "url", null);

                resultNode = objectMapper.createObjectNode();
                resultNode.put("profile_pic_url", profilePicUrl);
                resultNode.put("name", name);
                resultNode.put("url", url);
                resultNodesList.add(resultNode);
            }
        }
        return resultNodesList;
    }

}
