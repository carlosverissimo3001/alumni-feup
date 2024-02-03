package com.feupAlumni.alumniFEUP.model;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// View: Detect which alumnis don't have a linkedin associated - needed clean data
@Entity
public class ViewAlumniWithNoLinkClean {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id; // Primary key and auto incremented
    private String fullName;
    private String school;
    private String fieldOfStudy;
    private String course;
    private String courseLetters;
    private String yearStart;
    private String yearEnd;

    public ViewAlumniWithNoLinkClean(){

    }

    public ViewAlumniWithNoLinkClean(String fullName, String school, String fieldOfStudy,String course, String courseLetters, String yearStart, String yearEnd){
        this.fullName = fullName;
        this.school = school;
        this.fieldOfStudy = fieldOfStudy;
        this.course = course;
        this.courseLetters = courseLetters;
        this.yearStart = yearStart;
        this.yearEnd = yearEnd;
    }

    public String getFullName() {
        return fullName;
    }

    public String getSchool() {
        return school;
    }

    public String getFieldOfStudy() {
        return fieldOfStudy;
    }

    public String getCourse() {
        return course;
    }

    public String getCourseLetters() {
        return courseLetters;
    }

    public String getYearStart() {
        return yearStart;
    }

    public String getYearEnd() {
        return yearEnd;
    }

    public void setFulltName(String fulltName) {
        this.fullName = fulltName;
    }

    public void setSchool(String school) {
        this.school = school;
    }

    public void setFieldOfStudy(String fieldOfStudy) {
        this.fieldOfStudy = fieldOfStudy;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public void setCourseLetters(String courseLetters) {
        this.courseLetters = courseLetters;
    }

    public void setYearStart(String yearStart) {
        this.yearStart = yearStart;
    }

    public void setYearEnd(String yearEnd) {
        this.yearEnd = yearEnd;
    }

}
