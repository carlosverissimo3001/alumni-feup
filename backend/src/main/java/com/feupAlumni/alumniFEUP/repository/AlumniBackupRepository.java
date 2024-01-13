package com.feupAlumni.alumniFEUP.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.feupAlumni.alumniFEUP.model.AlumniBackup;

@Repository
public interface AlumniBackupRepository extends JpaRepository<AlumniBackup, Integer>{
    
}
