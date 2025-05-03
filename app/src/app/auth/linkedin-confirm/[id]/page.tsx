"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLinkedinConfirm } from "@/hooks/auth/useAuth";
import { LinkIcon, HelpCircleIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/misc/useToast";

export default function LinkedInConfirmPage() {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { id: personId } = useParams();
  
  // Validate the LinkedIn URL format
  const validateLinkedInUrl = (url: string) => {
    const regex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_%]+\/?$/;
    return regex.test(url);
  };

  console.log(personId);

  const { mutate, isPending } = useLinkedinConfirm({
    onSuccess: () => {
      router.push("/analytics");
    },
    onError: () => {
      setError("Failed to authenticate with LinkedIn. Please try again.");
      setSubmitting(false);
    },
    data: {
      linkedinConfirmDto: {
        personId: personId as string,
        linkedinUrl: linkedinUrl,
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error state
    setError("");

    // Validate the URL
    if (!linkedinUrl.trim()) {
      setError("Please enter your LinkedIn profile URL");
      return;
    }

    if (!validateLinkedInUrl(linkedinUrl)) {
      setError(
        "Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourname)"
      );
      return;
    }

    setSubmitting(true);

    try {
      mutate();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-md shadow-lg border-gray-200 p-2">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-2xl text-center text-[#8C2D19]">
            One Last Step
          </CardTitle>
          <CardDescription className="text-center pt-2">
            To complete your LinkedIn login, please provide your LinkedIn
            profile URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {error && (
            <Alert
              variant="destructive"
              className="mb-4 border-red-200 bg-red-50"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <label
                    htmlFor="linkedin-url"
                    className="text-sm font-medium text-gray-700"
                  >
                    LinkedIn Profile URL
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 ml-1">
                          <span className="text-xs text-gray-500">
                            Why is this needed?
                          </span>
                          <HelpCircleIcon
                            size={16}
                            className="text-gray-400 cursor-help"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3 bg-white border-2 border-[#8C2D19] shadow-lg rounded-lg">
                        <div className="text-xs text-gray-700 space-y-2">
                          <p className="font-semibold text-[#8C2D19] pb-1 border-b border-gray-200">
                            🔍 Connecting Your Profile
                          </p>
                          <p>
                            😔 We know that it seems convoluted to ask you to
                            provide your LinkedIn URL, after you&apos;ve just
                            logged in with LinkedIn.
                          </p>
                          <p>
                            🔒 However, LinkedIn&apos;s OAuth doesn&apos;t
                            provide us with enough information to identify your
                            profile against our AlumniEI database.
                          </p>
                          <p>
                            🔗 We need your LinkedIn URL to properly link your
                            LinkedIn account to your AlumniEI profile.
                          </p>
                          <p>
                            <strong>
                              We&apos;ll only ask for your LinkedIn URL once.
                            </strong>
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="linkedin-url"
                  placeholder="https://linkedin.com/in/yourname"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  required
                  className="w-full focus:ring-[#8C2D19] focus:border-[#8C2D19]"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-6 bg-[#8C2D19] hover:bg-[#A13A23] transition-colors duration-200 flex items-center justify-center gap-2"
              disabled={submitting || isPending}
            >
              <LinkIcon size={16} />
              {submitting || isPending
                ? "Completing Login..."
                : "Complete Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
