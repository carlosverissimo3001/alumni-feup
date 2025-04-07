'use client';

import ManualSubmissionForm from "@/components/forms/ManualSubmissionForm";

const JoinPage = () => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="w-full max-w-3xl p-4">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Join 30EIC</h2>
          <p className="text-gray-600 mt-2">
            Don&apos;t see your name on the website? Submit your information below to join our community.
          </p>
        </div>
        <ManualSubmissionForm />
      </div>
    </div>
  );
}

export default JoinPage; 