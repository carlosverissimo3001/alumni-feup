import { useState } from "react";
import { MAX_FILE_SIZE } from "@/consts";
import  NestApi from "@/api";
import { UploadExtractionDto, UPLOADTYPE } from "@/sdk/api";

type UploadParams = {
  faculty: string;
  course: string;
  upload_type: UPLOADTYPE;
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

  const uploadFile = async ({ faculty, course, upload_type }: UploadParams) => {
    if (!file) {
      setError("No file selected.");
      return false;
    }
  
    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);
  
    try {
      const formData = new FormData();
      formData.append("file", file); // File data
      formData.append("faculty_id", faculty);
      formData.append("course_id", course);
      formData.append("upload_type", upload_type as unknown as string);

      await NestApi.filesControllerCreate(
        formData as unknown as UploadExtractionDto,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
  
      setUploadSuccess(true);
      return true;
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        setError(
          errorData.message || 
          `Upload failed: ${errorData.code || 'Unknown error'}`
        );
      } else {
        setError(error instanceof Error ? error.message : "Upload failed");
      }
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
