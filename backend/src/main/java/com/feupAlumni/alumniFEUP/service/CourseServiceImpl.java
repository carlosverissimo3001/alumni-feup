package com.feupAlumni.alumniFEUP.service;

import java.io.InputStream;
import java.util.Iterator;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
            Sheet sheet = workbook.getSheetAt(1);   // 2nd sheet
            Iterator<Row> rowIterator = sheet.iterator();

            // Skip the first two rows
            for (int i=0; i<2; i++){
                if(rowIterator.hasNext()){
                    rowIterator.next();
                } 
            }

            while (rowIterator.hasNext()) {
                try {
                    // Reads the course of the current row
                    Row row = rowIterator.next();
                    String courses = row.getCell(10).getStringCellValue();
                    String[] coursesArray = courses.split(" ");
                    
                    for (String course : coursesArray) {
                        // Sees if the course exists in the table
                        Boolean courseExists = courseExists(course);
                        if(!courseExists){
                            System.out.println("----" + course);
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
