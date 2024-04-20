package com.feupAlumni.alumniFEUP.model;
import java.util.List;
import java.util.Map;

public class GeoJSONProperties {
    
    private List<String> name;
    private int students;
    private Map<String, String> listLinkedinLinksByUser ;
    private Map<String, Map<String, String>> coursesYearConclusionByUser; // Key: alumni Vlaue: map where key: course and value: year of conclusion

    public void setName(List<String> name) {
        this.name = name;
    }

    public List<String> getName() {
        return name;
    }

    public void setStudents(int students) {
        this.students = students;
    }

    public int getStudents() {
        return students;
    }

    public void setListLinkedinLinks(Map<String, String> listLinkedinLinksByUser) {
        this.listLinkedinLinksByUser = listLinkedinLinksByUser;
    }

    public Map<String, String> getListLinkedinLinks() {
        return listLinkedinLinksByUser;
    }

    public Map<String, Map<String, String>> getCoursesYearConclusionByUser() {
        return coursesYearConclusionByUser;
    }

    public void setCoursesYearConclusionByUser(Map<String, Map<String, String>> coursesYearConclusionByUser) {
        this.coursesYearConclusionByUser = coursesYearConclusionByUser;
    }
}
