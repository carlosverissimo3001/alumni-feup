package com.feupAlumni.alumniFEUP.repository;

import com.feupAlumni.alumniFEUP.model.ViewAlumniWithNoLinkClean;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ViewAlumniWithNoLinkCleanRepository extends JpaRepository<ViewAlumniWithNoLinkClean, Integer>{
    
}
