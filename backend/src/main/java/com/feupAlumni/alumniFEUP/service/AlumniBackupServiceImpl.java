package com.feupAlumni.alumniFEUP.service;

import com.feupAlumni.alumniFEUP.model.Alumni;
import com.feupAlumni.alumniFEUP.model.AlumniBackup;
import com.feupAlumni.alumniFEUP.repository.AlumniBackupRepository;
import com.feupAlumni.alumniFEUP.repository.AlumniRepository;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AlumniBackupServiceImpl implements AlumniBackupService{

    @Autowired
    private AlumniRepository alumniRepository;

    @Autowired
    private AlumniBackupRepository alumniBackupRepository;

    // Backs up alumnis from table "Alumni"
    @Override
    public void backupAlumnis() {
        List<Alumni> alumnis = alumniRepository.findAll();

        for (Alumni alumni : alumnis) {
            AlumniBackup alumniBackup = new AlumniBackup(alumni.getLinkedinLink(), alumni.getLinkedinInfo());
            alumniBackupRepository.save(alumniBackup);
        }

    }
}
