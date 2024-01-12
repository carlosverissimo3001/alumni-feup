package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.model.Student;

import java.util.List;

public interface StudentService {
    public Student saveStudent(Student student);
    public List<Student> getAllStudents();
}
