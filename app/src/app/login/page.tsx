"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LINKEDIN_URL } from "@/helpers/auth";
import { useState, useEffect, useCallback } from "react";
import { Info, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import Link from "next/link";

const JoinPage = () => {
  const router = useRouter();
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAcceptedPolicy(localStorage.getItem("acceptedPolicy") === "true");
  }, []);

  const handlePolicyChange = useCallback((checked: boolean) => {
    setAcceptedPolicy(checked);
    localStorage.setItem("acceptedPolicy", checked.toString());
  }, []);

  const handleLinkedInLogin = useCallback(() => {
    if (!acceptedPolicy) return;

    setIsLoading(true);
    setTimeout(() => {
      router.replace(LINKEDIN_URL);
    }, 600);
  }, [acceptedPolicy, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 animate-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-3 p-10 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
      >
        <div className="text-center space-y-2">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-bold text-gray-900"
          >
            Join Alumni FEUP
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-gray-600"
          >
            Login is reserved for members already listed on the platform.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xs text-center text-gray-500"
          >
            *Manual submissions are currently disabled.
          </motion.p>

        </div>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Already in the network?
              </span>
            </div>
          </div>

        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <Button
              variant="outline"
              disabled={!acceptedPolicy || isLoading}
              onClick={handleLinkedInLogin}
              className="flex w-full items-center justify-center gap-3 py-6"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Image
                    src="/logos/linkedin-icon.svg"
                    alt="LinkedIn logo"
                    width={20}
                    height={20}
                    priority
                  />
                  <span className="whitespace-nowrap">
                    Unlock extra features with LinkedIn
                  </span>
                </>
              )}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  aria-label="More information about LinkedIn login"
                  className="mt-2 rounded-md p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <Info className="h-5 w-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="right" className="max-w-xs text-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-indigo-500" />
                  <span className="font-semibold">Alumni-only Login</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li>
                    If you graduated from one of the courses we track and
                    don&apos;t see your name, we most likely couldn&apos;t find
                    your LinkedIn account.
                  </li>
                  <li>
                    If that&apos;s the case, you&apos;ll face issues when
                    trying to login.
                  </li>
                </ul>
                <div className="mt-3 text-xs text-slate-600">
                  Contact {" "}
                  <span className="font-semibold">
                    <a
                      href="mailto:carlosverissimo3001@gmail.com"
                      className="text-indigo-600 hover:underline"
                    >
                      carlosverissimo3001@gmail.com
                    </a>
                  </span>
                  {" "} to get it sorted out.
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <fieldset className="flex items-start space-x-2">
            <Checkbox
              id="privacy"
              checked={acceptedPolicy}
              onCheckedChange={handlePolicyChange}
            />
            <label
              htmlFor="privacy"
              className="cursor-pointer text-sm leading-relaxed text-slate-600"
            >
              I agree to the&nbsp;
              <Link
                href="/privacy-policy"
                className="font-medium text-indigo-600 underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </Link>
            </label>
          </fieldset>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinPage;
