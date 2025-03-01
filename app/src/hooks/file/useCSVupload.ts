import { useState } from "react";
import { MAX_FILE_SIZE } from "@/consts";
import AlumniApi from "@/api";

interface UploadParams {
  faculty: string;
  course: string;
}

export const useCSVUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const validateFile = (selectedFile: File | null | undefined) => {
    if (!selectedFile) {
      return "Please select a file.";
    }

    if (selectedFile.type !== "text/csv") {
      return "Invalid file type. Please upload a CSV file.";
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      return "File size exceeds 5MB limit.";
    }

    return null; // No errors
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    const validationError = validateFile(selectedFile);

    if (validationError) {
      setError(validationError);
      setFile(null);
    } else {
      setError(null);
      setFile(selectedFile);
      setUploadSuccess(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setUploadSuccess(false);
  };

  const uploadFile = async ({ faculty, course }: UploadParams) => {
    if (!file) {
      setError("Please select a file.");
      return false;
    }

    if (!faculty) {
      setError("Please select a faculty.");
      return false;
    }

    if (!course) {
      setError("Please select a course.");
      return false;
    }

    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log(formData);

      const response = await AlumniApi.extractionsControllerUploadFile(faculty, course, {
        data: formData,
      });
      
      setUploadSuccess(true);
      return true;
    } catch (error) {
      console.error("Upload failed", error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { 
    file, 
    error, 
    isUploading, 
    uploadSuccess,
    handleFileChange, 
    clearFile,
    uploadFile
  };
};
