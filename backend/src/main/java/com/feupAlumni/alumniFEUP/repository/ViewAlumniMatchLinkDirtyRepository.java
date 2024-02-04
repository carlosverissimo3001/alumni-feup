package com.feupAlumni.alumniFEUP.repository;

import com.feupAlumni.alumniFEUP.model.ViewAlumniMatchLinkDirty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ViewAlumniMatchLinkDirtyRepository extends JpaRepository<ViewAlumniMatchLinkDirty, Integer>{
    
}
