package com.feupAlumni.alumniFEUP.handlers;

import com.feupAlumni.alumniFEUP.model.Alumni;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;

public class CleanData {

    // If the table has registers they are deleted
    public static void cleanTable(JpaRepository<?, ?> repository) {
        if (repository.count() > 0) {
            try {
                System.out.println("-----");
                System.out.println("Table: " + repository + "populated. Registers are going to be deteled!");
                repository.deleteAll();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public static boolean isValidSchool(String schoolName) {
        // Convert school name to lowercase for case-insensitive comparison
        String lowerCaseSchool = schoolName.toLowerCase();
    
        // Check if the school name matches any of the specified values
        return (lowerCaseSchool.contains("faculdade de engenharia da universidade do porto") ||
               lowerCaseSchool.contains("feup") ||
               lowerCaseSchool.contains("faculty engineering university of porto") ||
               lowerCaseSchool.contains("universidade do porto") ||
               lowerCaseSchool.contains("university of porto") ||
               lowerCaseSchool.contains("faculdade de engenharia do porto")) && (!lowerCaseSchool.contains("business"));
    }

    // See if it has a valid name: all names of the alumni are in the student. Alumni with at least 2 names of the student and those in the same order.
    public static boolean validAlumniName(Alumni alumni, String studentNames) {
        String alumniLinkedinInfo = alumni.getLinkedinInfo();
        String alumniFullName = FilesHandler.extractFieldFromJson("full_name", alumniLinkedinInfo);
        String[] alumniNames = alumniFullName.split(" ");

        // Verifies if there is one name that is not inside the studentName
        Set<String> studentNamesSet = new HashSet<String>(Arrays.asList(studentNames.split(" ")));
        boolean hasMissingName = Arrays.stream(alumniNames).anyMatch(name -> !studentNamesSet.contains(name)); // returns true if there is a missing name
        if (hasMissingName) {
            return false; // If it has a name in the linkedin that doesn't belong to any of the student's name, then the alumni doesn't have a valid name for this student
        }

        // Verifies if the alumni has at least 2 names of the student and in the same order
        String[] studentNamesArray = studentNames.split(" ");
        int foundPosition = 0;
        int countNames = 0; 
        for (String alumniName : alumniNames) {
            for (int i=foundPosition; i<studentNamesArray.length; i++ ){
                if (alumniName.equals(studentNamesArray[i])) {
                    foundPosition = i;
                    countNames++;
                    break;
                }
            }
        }
        if (countNames < 2) {
            return false;
        }

        return true;
    }

}
