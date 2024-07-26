package com.feupAlumni.alumniFEUP.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Row;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.handlers.ExcelFilesHandler;
import com.feupAlumni.alumniFEUP.handlers.JsonFileHandler;
import com.feupAlumni.alumniFEUP.model.AlumniEic;
import com.feupAlumni.alumniFEUP.model.AlumniEic_has_Course;
import com.feupAlumni.alumniFEUP.model.Course;
import com.feupAlumni.alumniFEUP.repository.AlumniEicHasCourseRepository;

@Service
public class AlumniEicHasCoursesServiceImpl implements AlumniEicHasCoursesService{
     
    @Autowired
    private AlumniEicHasCourseRepository alumniEic_has_CourseRepository;
    @Autowired
    private AlumniEicService alumniEicService;
    @Autowired
    private CourseService courseService;
    
    @Override
    public void populateAlumniEicHasCoursesTable(MultipartFile file) {
        // Key: linkedin links Value: corresponding row 
        Map<String, Row> excelLinkedinLinksToRows = ExcelFilesHandler.excelLinkedinLinksToRows(file);

        // Iterates over the alumniEic table 
        List<AlumniEic> alumniEicList = alumniEicService.getAllAlumniEic();
        for (AlumniEic alumniEic : alumniEicList) { 
            Row correspondingRow = excelLinkedinLinksToRows.get(alumniEic.getLinkedinLink());
            if (correspondingRow != null) {
                // From the Excel: gets the courses and conclusion years
                int rowForCoursesConclusionYears = Integer.parseInt(JsonFileHandler.getPropertyFromApplicationProperties("excel.rowForCursos"));
                String coursesConclusionYears = correspondingRow.getCell(rowForCoursesConclusionYears).getStringCellValue();

                // Remove leading/trailing whitespaces
                coursesConclusionYears = coursesConclusionYears.trim();
                // Split by spaces
                String[] coursesConclusionYearsParts = coursesConclusionYears.split("\\s+");

                // Stores the courses and respective cocnlusion years in a map
                // Key: course  Value: conclusion year
                Map<String, String> coursesYearsMap = new HashMap<>();
                for (int i = 0; i < coursesConclusionYearsParts.length; i += 2) {
                    if (i + 1 < coursesConclusionYearsParts.length) {
                        coursesYearsMap.put(coursesConclusionYearsParts[i], coursesConclusionYearsParts[i + 1]);
                    } else {
                        // Handle the case where the course doesn't have a corresponding year
                        coursesYearsMap.put(coursesConclusionYearsParts[i], "No Year");
                    }
                }
                
                // Stores the course and respective cocnlusion year in the DB
                for (String courseEntry : coursesYearsMap.keySet()) {
                    Course foundCourse = courseService.findCourseByAbreviation(courseEntry);
                    String foundYearOfConclusion = coursesYearsMap.get(courseEntry);
                    // Saves the Relationship
                    AlumniEic_has_Course alumniEicHasCourse = new AlumniEic_has_Course(alumniEic, foundCourse, foundYearOfConclusion);
                    saveRelationAlumniCourse(alumniEicHasCourse);
                }
            }
        }
        System.out.println("AlumniEIC_Has_Courses table re-populated");
        System.out.println("-----"); 
    }

    @Override
    public void saveRelationAlumniCourse(AlumniEic_has_Course alumniEicHasCourse) {
        alumniEic_has_CourseRepository.save(alumniEicHasCourse);
    }

    @Override
    public void cleanAlumniEicHasCourseTable() {
        if (alumniEic_has_CourseRepository.count() > 0) {
            try {
                System.out.println("-----");
                System.out.println("Registers are going to be deteled from: " + alumniEic_has_CourseRepository);
                alumniEic_has_CourseRepository.deleteAll();
            } catch (Exception e) {
                e.printStackTrace();
            }
        } 
    }
}
