import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheetIcon, XIcon } from "lucide-react";
import { useEffect, useRef } from "react";

interface CSVInfoPanelProps {
  onClose: () => void;
}

export const CSVInfoPanel = ({ onClose }: CSVInfoPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <Card ref={panelRef} className="max-w-md shadow-lg border-0">
        <CardHeader className="bg-slate-50 rounded-t-lg border-b pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSpreadsheetIcon size={18} className="text-primary" />
            CSV Format Requirements
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Your CSV file must include the following columns:
            </p>
            <div className="bg-slate-50 p-4 rounded-md">
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li><span className="font-medium"><em>full_name</em></span> - Student&apos;s complete name</li>
                <li>
                  <span className="font-medium"><em>conclusion_year</em></span> - the year of conclusion of the student
                  <ul className="list-disc pl-5 mt-1 text-xs text-slate-500">
                    <li>Example: 2019 (2018/2019 also accepted)</li>
                  </ul>
                </li>
                <li>
                  <span className="font-medium"><em>linkedin_url</em></span> - The LinkedIn URL of the student
                </li>
              </ul>
            </div>
            <p className="text-xs text-slate-500">
              Make sure your CSV is properly formatted with headers matching the required column names exactly.
            </p>
            <p className="text-xs text-red-500">
              ONLY include students who have completed the course.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 