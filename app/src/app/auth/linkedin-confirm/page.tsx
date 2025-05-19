"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useLinkedinConfirm,
  useVerifyEmail,
  useVerifyEmailToken,
} from "@/hooks/auth/useAuth";
import { LinkIcon, HelpCircleIcon, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { validateLinkedInUrl } from "@/utils/validation";
import Cookies from "js-cookie";
import { useToast } from "@/hooks/misc/useToast";

export default function LinkedInConfirmPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const initialCodeSent = useRef(false);

  // We get these from the cookies
  const [personId, setPersonId] = useState<string | undefined>(undefined);
  const [firstName, setFirstName] = useState<string | undefined>(undefined);
  const [lastName, setLastName] = useState<string | undefined>(undefined);
  const [profilePictureUrl, setProfilePictureUrl] = useState<
    string | undefined
  >(undefined);
  const [personalEmail, setPersonalEmail] = useState<string | undefined>(
    undefined
  );
  const [maskedEmail, setMaskedEmail] = useState<string | undefined>(undefined);

  const [otpCode, setOtpCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const maskEmail = (email: string) => {
    const [username, domain] = email.split("@");
    const maskedUsername =
      username.charAt(0) +
      "*".repeat(username.length - 2) +
      username.charAt(username.length - 1);
    const [domainName, extension] = domain.split(".");
    const maskedDomain =
      domainName.charAt(0) + "*".repeat(domainName.length - 1);
    return `${maskedUsername}@${maskedDomain}.${extension}`;
  };

  const { mutate: sendVerificationEmail, isPending: isSendingEmail } =
    useVerifyEmail({
      data: {
        verifyEmailDto: {
          email: personalEmail || emailInput,
        },
      },
      onSuccess: () => {
        toast({
          title: "Verification code sent!",
          description: "Please check your email for the verification code.",
          variant: "success",
        });
        setResendCooldown(60);
      },
      onError: () => {
        toast({
          title: "Failed to send verification code",
          description: "Please try again later",
          variant: "destructive",
        });
      },
    });

  const handleSendVerificationEmail = useCallback(() => {
    if ((personalEmail || emailInput) && !initialCodeSent.current) {
      sendVerificationEmail();
      initialCodeSent.current = true;
    }
  }, [personalEmail, emailInput, sendVerificationEmail]);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace("/analytics");
      return;
    }

    setPersonId(Cookies.get("linkedin_person_id") ?? undefined);
    setFirstName(Cookies.get("linkedin_first_name") ?? undefined);
    setLastName(Cookies.get("linkedin_last_name") ?? undefined);
    setProfilePictureUrl(
      Cookies.get("linkedin_profile_picture_url") ?? undefined
    );
    const email = Cookies.get("linkedin_personal_email") ?? undefined;
    setPersonalEmail(email);
    if (email) {
      setMaskedEmail(maskEmail(email));
      if (!initialCodeSent.current) {
        handleSendVerificationEmail();
      }
    } else {
      setShowEmailInput(true);
    }
  }, [isAuthenticated, router, user, handleSendVerificationEmail]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prevCooldown) => prevCooldown - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);

  const { mutate: verifyEmailToken, isPending: isVerifyingToken } =
    useVerifyEmailToken({
      data: {
        verifyEmailTokenDto: {
          token: otpCode,
          email: personalEmail || emailInput,
        },
      },
      onSuccess: () => {
        setIsEmailVerified(true);
        toast({
          title: "Success!",
          description: "Email verified successfully!",
          variant: "success",
        });
        if (!personalEmail) {
          setPersonalEmail(emailInput);
        }
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Invalid verification code. Please try again.",
          variant: "destructive",
        });
      },
    });

  const { mutate, isPending } = useLinkedinConfirm({
    onSuccess: () => {
      router.push("/analytics");
    },
    onError: () => {
      setError(
        "We couldn't find your LinkedIn profile in our database. This could be because:\n\n" +
          "1. There might be a typo in your LinkedIn URL. Please double-check and try again.\n\n" +
          "2. Your profile might not be in our database yet. Please reach out to the team for assistance."
      );
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

    if (!isEmailVerified) {
      setError("Please verify your email first");
      return;
    }

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
      <Card className="w-full max-w-md shadow-lg border-gray-100">
        <CardHeader className="space-y-3 text-center pb-6">
          <CardTitle className="text-2xl font-semibold text-[#8C2D19]">
            One Last Step
          </CardTitle>
          {firstName && (
            <div className="py-2.5 px-4 bg-[#fdf5f3] rounded-md border border-[#f5e1dc]">
              <div className="font-medium text-[#8C2D19] text-lg">
                {firstName} {lastName}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert
              variant="destructive"
              className="border-red-100 bg-red-50 whitespace-pre-wrap"
            >
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-5 pt-5 pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      Email Verification
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600">
                        Please verify your email to continue
                      </p>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger
                            asChild
                            onClick={(e) => e.preventDefault()}
                          >
                            <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white p-3 shadow-lg border border-gray-200">
                            <p className="text-sm text-gray-600 max-w-xs">
                              We verify emails to ensure legitimate submissions
                              and maintain the quality of our alumni network.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  {isEmailVerified && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Verified
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 pb-5 space-y-4">
                {showEmailInput ? (
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="your@email.com"
                        type="email"
                        disabled={isEmailVerified}
                        className={`transition-all duration-200 ${
                          isEmailVerified ? "bg-gray-50 text-gray-500" : ""
                        }`}
                        required
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => sendVerificationEmail()}
                        disabled={
                          isEmailVerified ||
                          isSendingEmail ||
                          resendCooldown > 0 ||
                          !emailInput
                        }
                        className="min-w-[100px] bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        {isSendingEmail ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
                            <span>Sending...</span>
                          </div>
                        ) : resendCooldown > 0 ? (
                          `Wait ${resendCooldown}s`
                        ) : (
                          "Send Code"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      We&apos;ve sent a verification code to {maskedEmail}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowEmailInput(true)}
                      className="text-sm text-[#8C2D19] hover:text-[#A13A23] hover:bg-[#fdf5f3] p-0 h-auto font-medium"
                    >
                      Not your email?
                    </Button>
                  </div>
                )}

                {((showEmailInput && emailInput) ||
                  (!showEmailInput && personalEmail)) &&
                  !isEmailVerified && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top duration-300">
                      <label
                        htmlFor="otpCode"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        Verification Code{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="otpCode"
                          value={otpCode}
                          onChange={(e) =>
                            setOtpCode(e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="font-mono tracking-wider text-center text-lg"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => verifyEmailToken()}
                          disabled={otpCode.length < 6 || isVerifyingToken}
                          className="min-w-[100px] bg-gray-100 hover:bg-gray-200 text-gray-700"
                        >
                          {isVerifyingToken ? (
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
                              <span>Verifying...</span>
                            </div>
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Didn&apos;t receive the code?{" "}
                        {resendCooldown > 0 ? (
                          <span className="text-gray-400">
                            Resend in {resendCooldown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => sendVerificationEmail()}
                            disabled={isSendingEmail || resendCooldown > 0}
                            className="text-[#8C2D19] hover:text-[#A13A23] font-medium disabled:opacity-50"
                          >
                            Send again
                          </button>
                        )}
                      </p>
                    </div>
                  )}
              </div>
            </div>

            {/* LinkedIn URL Section - Only show if email is verified */}
            {isEmailVerified && (
              <div className="space-y-4 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="linkedin-url"
                      className="text-sm font-medium text-gray-700"
                    >
                      LinkedIn Profile URL{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                            <span className="text-xs">Why is this needed?</span>
                            <HelpCircleIcon size={16} className="cursor-help" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-white p-3 shadow-lg border border-gray-200">
                          <div className="text-sm text-gray-600 max-w-xs space-y-2">
                            <p className="font-medium text-[#8C2D19]">
                              🔍 Why we need this
                            </p>
                            <p>
                              LinkedIn&apos;s login doesn&apos;t provide enough
                              information to identify your profile in our
                              database.
                            </p>
                            <p className="font-medium">
                              We&apos;ll only ask for this once.
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
            )}

            <Button
              type="submit"
              className="w-full py-6 bg-[#8C2D19] hover:bg-[#A13A23] transition-colors duration-200 flex items-center justify-center gap-2 text-lg font-medium"
              disabled={!isEmailVerified || submitting || isPending}
            >
              <LinkIcon size={20} />
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
