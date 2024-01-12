package com.feupAlumni.alumniFEUP.repository;

import com.feupAlumni.alumniFEUP.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {


}
