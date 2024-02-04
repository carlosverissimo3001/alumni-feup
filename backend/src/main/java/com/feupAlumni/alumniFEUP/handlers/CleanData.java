package com.feupAlumni.alumniFEUP.handlers;

public class CleanData {

    public static boolean isValidSchool(String schoolName) {
        // Convert school name to lowercase for case-insensitive comparison
        String lowerCaseSchool = schoolName.toLowerCase();
    
        // Check if the school name matches any of the specified values
        return lowerCaseSchool.contains("faculdade de engenharia da universidade do porto") ||
               lowerCaseSchool.contains("feup") ||
               lowerCaseSchool.contains("faculty engineering university of porto") ||
               lowerCaseSchool.contains("universidade do porto") ||
               lowerCaseSchool.contains("university of porto") ||
               lowerCaseSchool.contains("faculdade de engenharia do porto");
    }

    // Given a course and a field of study it sees if it can be considered a MIEIC course. integ comes from "integrado" or "integrated" or other variatios
    public static boolean isValidMIEIC(String course, String fieldOfStudy) {
        if (course.contains("integ") ||  fieldOfStudy.contains("integ")) { 
            return true;
        }
        return false;
    }

    // Given a course sees if it can be considered a LEIC or L.EIC course. lic for variantes of licenciature -- bach for variantes of bacheler
    public static boolean isValidLEIC(String course) {
        if ( 
            (course.contains("lic") || 
            course.contains("bach") || 
            course.contains("gradua") || 
            course.contains("undergraduate") || 
            (course.contains("3")) || 
            course.contains("degree") ) 
            &&
            (!course.contains("mast") &&
            !course.contains("5") && 
            !course.contains("post"))
            ) {
            return true;
        }
        return false;
    }

    // Given a course and a field of study it sees if it can be considered a M.EIC course
    public static boolean isValidMEIC(String course, String fieldOfStudy) {
        if (course.contains("comp") || fieldOfStudy.contains("comp")) {
            return true;
        }
        return false;
    }

    // Given a course and a field of study it sees if it can be considered a MEI course
    public static boolean isValidMEI(String course, String fieldOfStudy) {
        if ((fieldOfStudy.contains("eng") || fieldOfStudy.contains("inf")) && ((course.contains("5") && !course.contains("3")) || course.contains("ms") || course.contains("m.sc") || course.contains("master") || course.contains("mestrado"))) {
            return true;
        }
        return false;
    }

    // Verifies if it's a valid year of begining and end
    public static boolean isValidYearBegEnd(String yearStart, String[] schoolYearBeginning, String yearEnd, String[] schoolYearConclusion) {
        if (yearStart.equals(schoolYearBeginning[0]) && yearEnd.equals(schoolYearConclusion[1])) {
            return true;
        }
        return false;
    }

}
