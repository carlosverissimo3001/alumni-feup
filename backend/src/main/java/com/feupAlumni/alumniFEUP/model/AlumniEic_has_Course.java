package com.feupAlumni.alumniFEUP.model;

import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Entity;

@Entity
public class AlumniEic_has_Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumni_eic_id")
    private AlumniEic alumniEic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    private String yearOfConclusion;

    public AlumniEic_has_Course(){

    }

    public AlumniEic_has_Course(AlumniEic alumniEic, Course course, String yearOfConclusion){
        this.alumniEic = alumniEic;
        this.course = course;
        this.yearOfConclusion = yearOfConclusion;
    }

    public Long getId() {
        return id;
    }

    public AlumniEic getAlumniEic() {
        return alumniEic;
    }

    public Course getCourse() {
        return course;
    }

    public String getYearOfConclusion() {
        return yearOfConclusion;
    }

    public void setAlumniEic(AlumniEic alumniEic) {
        this.alumniEic = alumniEic;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public void setYearOfConclusion(String yearOfConclusion) {
        this.yearOfConclusion = yearOfConclusion;
    }
}
