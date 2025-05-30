"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LINKEDIN_URL } from "@/helpers/auth";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ManualSubmissionForm from "@/components/forms/ManualSubmissionForm";

const JoinPage = () => {
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const policyAccepted = localStorage.getItem("acceptedPolicy");
    if (policyAccepted === "true") {
      setAcceptedPolicy(true);
    }
  }, []);

  const handlePolicyChange = (checked: boolean) => {
    setAcceptedPolicy(checked);
    localStorage.setItem("acceptedPolicy", checked.toString());
  };

  const onVerify = () => {
    if (acceptedPolicy) {
      setIsLoading(true);
      setTimeout(() => {
        window.location.href = LINKEDIN_URL;
      }, 1000); // Simulate a loading delay
    }
  };

  if (showManualForm) {
    return <ManualSubmissionForm onBack={() => setShowManualForm(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 animate-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
      >
        <div className="text-center space-y-2">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-bold text-gray-900"
          >
            Join 30EIC
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-gray-600"
          >
            Submit your information to join our alumni network
          </motion.p>
        </div>

        <div className="space-y-4">
          {/* Manual Submission Option */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => setShowManualForm(true)}
              variant="default"
              className="w-full flex items-center justify-center gap-2 px-4 py-6 bg-gray-900 hover:bg-gray-800 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
              ) : (
                <>
                  Join the Network
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </motion.div>

          <p className="text-xs text-center text-gray-500">
            *All submissions will be reviewed before appearing on the website
          </p>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Already in the network?
              </span>
            </div>
          </div>

          {/* LinkedIn Verification Option */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onVerify}
              disabled={!acceptedPolicy}
              variant="outline"
              className="w-full flex items-center justify-center gap-3 px-4 py-6"
            >
              <motion.svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                animate={acceptedPolicy ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </motion.svg>
              Unlock extra features with LinkedIn
            </Button>
          </motion.div>

          {/* Privacy Policy Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="privacy"
              checked={acceptedPolicy}
              onCheckedChange={handlePolicyChange}
              className="border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <label
              htmlFor="privacy"
              className="text-sm text-gray-600 cursor-pointer"
            >
              I agree to the{" "}
              <a
                href="/privacy-policy"
                className="text-blue-600 hover:underline font-medium"
              >
                Privacy Policy
              </a>
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinPage;
