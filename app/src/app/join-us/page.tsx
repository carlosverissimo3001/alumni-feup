'use client';

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LINKEDIN_URL } from "@/helpers/auth";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

const JoinPage = () => {
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  const onSignIn = () => {
    if (acceptedPolicy) {
      window.location.href = LINKEDIN_URL;
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Join 30EIC</h2>
          <p className="text-gray-600">Choose how you want to join the platform</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="privacy" 
              checked={acceptedPolicy}
              onCheckedChange={(checked: boolean) => setAcceptedPolicy(checked)}
            />
            <label htmlFor="privacy" className="text-sm text-gray-600 cursor-pointer">
              I agree to the{' '}
              <a href="/privacy-policy" className="text-blue-600 hover:underline font-medium">
                Privacy Policy
              </a>
            </label>
          </div>

          <Button
            onClick={onSignIn}
            disabled={!acceptedPolicy}
            className="w-full flex items-center justify-center gap-3 px-4 py-6 bg-[#0A66C2] hover:bg-[#004182] text-white"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
            Continue with LinkedIn
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Guest Option */}
          <Button
            onClick={() => console.log("Open guest form")}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 px-4 py-6"
          >
            Manual Submission
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* <p className="text-xs text-center text-gray-500">
          *Guest submissions will be reviewed before appearing on the map
        </p> */}
      </div>
    </div>
  );
}

export default JoinPage; 