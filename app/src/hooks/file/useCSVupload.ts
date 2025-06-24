import { useState } from "react";
import { MAX_FILE_SIZE } from "@/consts";

type UploadParams = {
  facultyId: string;
  courseId: string;
};

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

  const uploadFile = async ({ facultyId, courseId }: UploadParams) => {
    if (!file) {
      setError("No file selected.");
      return false;
    }

    setIsUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("facultyId", facultyId);
      formData.append("courseId", courseId);

      // TODO: Change this to use the SDK
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      setUploadSuccess(true);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Upload failed");
      }
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
    uploadFile,
  };
};
