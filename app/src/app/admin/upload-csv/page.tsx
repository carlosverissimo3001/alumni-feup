"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CSVUpload from "@/components/file/csvUpload";

const UploadCSVPage = () => {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <CSVUpload />
      </div>
    </div>
  );
};

export default UploadCSVPage; 