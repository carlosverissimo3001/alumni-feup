"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCSVUpload } from "@/hooks/file/useCSVupload";
import { FileSpreadsheetIcon, UploadIcon, InfoIcon } from "lucide-react";
import { CSVInfoPanel } from "@/components/file/csvInfoPanel";
import { useDropzone } from "react-dropzone";
import { useListFaculties } from "@/hooks/faculty/useListFaculties";
import { useListCourses } from "@/hooks/courses/useListCourses";
import { LoadingButton } from "../ui/loading-button";


const CSVUpload = () => {
  const {
    file,
    error,
    isUploading,
    uploadSuccess,
    handleFileChange,
    clearFile,
    uploadFile,
  } = useCSVUpload();

  const [faculty, setFaculty] = useState<string | undefined>(undefined);
  const [course, setCourse] = useState<string | undefined>(undefined);
  const [showInfo, setShowInfo] = useState(false);

  const { data: faculties, isLoading: isLoadingFaculties } = useListFaculties();

  const { data: courses, isLoading: isLoadingCourses } = useListCourses({
    facultyIds: faculty ? [faculty] : undefined,
    enabled: !!faculty,
  });

  const isLoading = isLoadingFaculties || isLoadingCourses;

  const handleClearSelection = () => {
    setFaculty(undefined);
    setCourse(undefined);
    clearFile();
  };

  const handleUpload = async () => {
    if (!faculty || !course) return;

    const success = await uploadFile({
      faculty: faculty,
      course: course,
    });

    if (success) {
      setTimeout(() => {
        handleClearSelection();
      }, 2000);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const event = {
          target: { files: acceptedFiles as unknown as FileList },
        } as React.ChangeEvent<HTMLInputElement>;
        handleFileChange(event);
      }
    },
    [handleFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  return (
    <>
      <Card className="max-w-2xl mx-auto shadow-md border-0">
        <CardHeader className="bg-slate-50 rounded-t-lg border-b pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileSpreadsheetIcon size={20} className="text-primary" />
            Upload Extraction CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="faculty" className="text-sm font-medium">
                Faculty
              </Label>
              <Select
                onValueChange={setFaculty}
                disabled={isLoading}
                value={faculty || ""}
              >
                <SelectTrigger
                  id="faculty"
                  className="h-11 border-slate-200 focus:ring-2 focus:ring-primary/20"
                >
                  <SelectValue placeholder="Choose a faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties?.map((fac) => (
                    <SelectItem key={fac.id} value={fac.id}>
                      {fac.acronym && `${fac.acronym} - ${fac.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course" className="text-sm font-medium">
                Course
              </Label>
              <Select
                onValueChange={setCourse}
                disabled={isLoading || !faculty}
                value={course || ""}
              >
                <SelectTrigger
                  id="course"
                  className="h-11 border-slate-200 focus:ring-2 focus:ring-primary/20"
                >
                  <SelectValue
                    placeholder={
                      faculty ? "Choose a course" : "Select a faculty first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.acronym && `${c.acronym} - ${c.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="csv" className="text-sm font-medium">
                CSV File
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-slate-500 hover:text-primary"
                onClick={() => setShowInfo(!showInfo)}
              >
                <InfoIcon className="h-4 w-4 mr-1" />
                CSV Format
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : file
                    ? "border-green-500/50 bg-green-50/50"
                    : "border-slate-200 hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                <Label className="cursor-pointer flex flex-col items-center gap-2">
                  <UploadIcon
                    className={`h-6 w-6 ${
                      file ? "text-green-500" : "text-slate-400"
                    }`}
                  />
                  <span className="font-medium text-sm">
                    {file ? file.name : "Choose a CSV file or drag & drop"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {file
                      ? `${(file.size / 1024).toFixed(2)} KB`
                      : "CSV files only"}
                  </span>
                </Label>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="text-sm">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {uploadSuccess && (
            <Alert
              variant="success"
              className="text-sm bg-green-50 text-green-700 border-green-200"
            >
              <AlertDescription>
                CSV file uploaded successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
              disabled={!file && !faculty && !course}
              className="text-slate-600 hover:text-slate-900"
            >
              Clear Selection
            </Button>
          </div>

          <LoadingButton
            onClick={handleUpload}
            disabled={!file || !faculty || !course || isUploading}
            className="w-full h-11"
          >
            {isUploading ? "Uploading..." : "Upload CSV"}
          </LoadingButton>
        </CardContent>
      </Card>

      {/* CSV Info Panel */}
      {showInfo && <CSVInfoPanel onClose={() => setShowInfo(false)} />}
    </>
  );
};

export default CSVUpload;
