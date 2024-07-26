package com.feupAlumni.alumniFEUP.handlers;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

public class TxtFilesHandler {
    
    // Returns a report file of invalid Excel features or/and errors when calling the Proxycurl API
    public static File writeErrorFile (List<String> arrayWithExcelStructureError, List<String> arrayWithPopulationErrors) throws IOException {
        File errorFile = new File("");
        if (!(arrayWithExcelStructureError.size()==0) || !(arrayWithPopulationErrors.size()==0)) {
            errorFile = File.createTempFile("errorsAlumnusData", ".txt");
            try (BufferedWriter writer = new BufferedWriter(new FileWriter(errorFile))) {
                if (arrayWithExcelStructureError.size()!=0) {
                    writer.write("------ Excel Structure Errors ------");
                    writer.newLine();
                    for (String errorMessage : arrayWithExcelStructureError) {
                        writer.write(errorMessage);
                        writer.newLine();
                    }
                }
                if (arrayWithPopulationErrors.size()!=0) {
                    writer.write("------ Calls to ProxyCurl API Errors ------");
                    writer.newLine();
                    for (String errorMessage : arrayWithPopulationErrors) {
                        writer.write(errorMessage);
                        writer.newLine();
                    }
                }
            }
        }
        return errorFile;
    }
        
}
