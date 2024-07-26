package com.feupAlumni.alumniFEUP.service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.feupAlumni.alumniFEUP.handlers.JsonFileHandler;
import com.feupAlumni.alumniFEUP.model.Course;
import com.feupAlumni.alumniFEUP.repository.CourseRepository;

import org.apache.poi.ss.usermodel.*;

@Service
public class CourseServiceImpl implements CourseService{
     
    @Autowired
    private CourseRepository courseRepository;

    @Override
    public void populateCoursesTable(MultipartFile file) {
        // Goes through the excel file
        try (InputStream inputStream = file.getInputStream()){
            // Read and iterate over the excel file
            Workbook workbook = WorkbookFactory.create(inputStream);
            int sheetToReafFrom = Integer.parseInt(JsonFileHandler.getPropertyFromApplicationProperties("excel.sheet").trim());
            Sheet sheet = workbook.getSheetAt(sheetToReafFrom);   // Selects the sheet
            Iterator<Row> rowIterator = sheet.iterator();

            // Skip the first row, which corresponds to headers
            for (int i=0; i<1; i++){
                if(rowIterator.hasNext()){
                    rowIterator.next();
                } 
            }

            // Iterate over each row
            while (rowIterator.hasNext()) {
                try {
                    // Reads the courses and conclusion years of the current row
                    int cellCoursesConclusionYears = Integer.parseInt(JsonFileHandler.getPropertyFromApplicationProperties("excel.rowForCursos").trim());
                    Row row = rowIterator.next();
                    String coursesConclusionYears  = row.getCell(cellCoursesConclusionYears).getStringCellValue();

                    List<String> courses = new ArrayList<>();

                    // Removes leading/trailing whitespaces
                    coursesConclusionYears = coursesConclusionYears.trim();
                    // Split by spaces
                    String[] coursesConclusionYearsParts = coursesConclusionYears.split("\\s+");
                    for (int i=0; i<coursesConclusionYearsParts.length; i+=2) {
                        courses.add(coursesConclusionYearsParts[i]);
                    }
                    
                    // Adds course to DB
                    for (String course : courses) {
                        // Sees if the course exists in the table
                        Boolean courseExists = courseExists(course);
                        if(!courseExists){
                            // Stores the information in the DB
                            Course courseDb = new Course(course);
                            savesCourse(courseDb);
                        }                   
                    }                     
                } catch (Exception error) {
                    System.out.println("error: " + error);
                }
            }
            System.out.println("Course Table Populated.");
            System.out.println("-----");
        } catch (Exception e) {
            throw new RuntimeException("Error processing file", e);
        }
    }

    @Override
    public void savesCourse(Course course) {
        courseRepository.save(course);
    }

    @Override
    public boolean courseExists(String course) {
        return courseRepository.existsByAbbreviation(course);
    }

    @Override
    public Course findCourseByAbreviation(String course) {
        return courseRepository.findByAbbreviation(course);
    }

    @Override
    public void cleanCourseTable() {
        if (courseRepository.count() > 0) {
            try {
                System.out.println("-----");
                System.out.println("Registers are going to be deteled from: " + courseRepository);
                courseRepository.deleteAll();
            } catch (Exception e) {
                e.printStackTrace();
            }
        } 
    }
}
