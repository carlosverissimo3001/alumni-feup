"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { validateLinkedInUrl } from "@/utils/validation";
import Cookies from "js-cookie";

export default function LinkedInConfirmPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  // We get these from the cookies
  const [personId, setPersonId] = useState<string | undefined>(undefined);
  const [firstName, setFirstName] = useState<string | undefined>(undefined);
  const [lastName, setLastName] = useState<string | undefined>(undefined);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>(undefined);
  const [personalEmail, setPersonalEmail] = useState<string | undefined>(undefined);
  
  // Prevent authenticated users from accessing this page
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace('/analytics');
      return;
    }

    setPersonId(Cookies.get('linkedin_person_id') ?? undefined);
    setFirstName(Cookies.get('linkedin_first_name') ?? undefined);
    setLastName(Cookies.get('linkedin_last_name') ?? undefined);
    setProfilePictureUrl(Cookies.get('linkedin_profile_picture_url') ?? undefined);
    setPersonalEmail(Cookies.get('linkedin_personal_email') ?? undefined);
  }, [isAuthenticated, router, user]);
  
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  
  const { mutate, isPending } = useLinkedinConfirm({
    onSuccess: () => {
      router.push("/analytics");
    },
    onError: () => {
      setError("Failed to authenticate with LinkedIn. Please try again.");
      setSubmitting(false);
    },
    data: {
      linkedinAuthDto: {
        personId: personId as string,
        linkedinUrl: linkedinUrl,
        firstName: firstName as string,
        lastName: lastName as string,
        profilePictureUrl,
        personalEmail,
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
          {firstName && (
            <div className="text-center my-2 py-2 px-4 bg-[#f8f3f2] rounded-md border border-[#e9d6d3]">
              <div className="font-bold text-[#8C2D19] text-lg">
                {firstName} {lastName}
              </div>
            </div>
          )}
          <CardDescription className="text-center pt-2">
            Please provide your LinkedIn profile URL
          </CardDescription>
          {firstName && (
            <p className="text-center text-sm mt-1 text-gray-600">
              This URL will be verified with your account
            </p>
          )}
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
                        <div className="text-xs text-gray-700 space-y-1">
                          <p className="font-semibold text-[#8C2D19] pb-1 border-b border-gray-200">
                            🔍 Why we need this
                          </p>
                          <p>
                            LinkedIn&apos;s login doesn&apos;t provide enough information to identify your profile in our database.
                          </p>
                          <p>
                            <strong>We&apos;ll only ask for this once.</strong>
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
