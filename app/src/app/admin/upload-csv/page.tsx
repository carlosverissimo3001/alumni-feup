"use client";

import CSVUpload from "@/components/file/csvUpload";
import { AdminBackLink } from "@/components/admin/adminBackLink";

const UploadCSVPage = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <AdminBackLink href="/admin" className="mb-4" />

        <CSVUpload />
      </div>
    </div>
  );
};

export default UploadCSVPage; 
