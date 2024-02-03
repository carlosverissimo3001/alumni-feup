package com.feupAlumni.alumniFEUP.repository;

import com.feupAlumni.alumniFEUP.model.ViewAlumniWithNoLinkDirty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ViewAlumniWithNoLinkDirtyRepository extends JpaRepository<ViewAlumniWithNoLinkDirty, Integer>{
    
}
