package com.feupAlumni.alumniFEUP.repository;

import com.feupAlumni.alumniFEUP.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer> {
    
}
