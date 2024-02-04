package com.feupAlumni.alumniFEUP.repository;

import com.feupAlumni.alumniFEUP.model.ViewAlumniMatchLinkClean;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ViewAlumniMatchLinkCleanRepository extends JpaRepository<ViewAlumniMatchLinkClean, Integer>{
    List<ViewAlumniMatchLinkClean> findByCourseLetters(String courseLetters);
}
