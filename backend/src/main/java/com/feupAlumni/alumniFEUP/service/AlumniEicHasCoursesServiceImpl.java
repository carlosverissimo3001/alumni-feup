package com.feupAlumni.alumniFEUP.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Row;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.handlers.ExcelFilesHandler;
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
                // From the Excel: gets the courses and years of conclusion
                String courses = correspondingRow.getCell(10).getStringCellValue();
                String[] coursesArray = courses.split(" ");
                Map<Course, String> courseYearMap = new HashMap<>();
                
                for (String course : coursesArray) {
                    String yearConclusion = "";
                    Course courseMap;
                    switch (course) {
                        case "LEIC":
                            yearConclusion = correspondingRow.getCell(12).getStringCellValue();
                            break;
                        case "MEI":
                            yearConclusion = correspondingRow.getCell(14).getStringCellValue();
                            break;
                        case "MIEIC":
                            yearConclusion = correspondingRow.getCell(16).getStringCellValue();
                            break;
                        case "L.EIC":
                            yearConclusion = correspondingRow.getCell(18).getStringCellValue();
                            break;
                        case "M.EIC":
                            yearConclusion = correspondingRow.getCell(20).getStringCellValue();
                            break;
                        default:
                            break;
                    }
                    courseMap = courseService.findCourseByAbreviation(course);
                    courseYearMap.put(courseMap, yearConclusion);

                    // Saves the relationship
                    for (Course courseEntry : courseYearMap.keySet()) {
                        String yearOfConclusion = courseYearMap.get(courseEntry);
                        AlumniEic_has_Course alumniEicHasCourse = new AlumniEic_has_Course(alumniEic, courseEntry, yearOfConclusion);
                        saveRelationAlumniCourse(alumniEicHasCourse);
                    }
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
