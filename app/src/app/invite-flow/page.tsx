"use client";

import { useState } from "react";
import { useVerifyEmail, useVerifyEmailToken } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/misc/useToast";

export default function InviteFlow() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"email" | "token">("email");

  const { mutate: verifyEmail } = useVerifyEmail({
    data: {
      verifyEmailDto: {
        email,
        isInviteFlow: true,
      },
    },
    onSuccess: () => {
      toast({
        title: "Check your email for the verification code!",
        variant: "success",
      });
      setStep("token");
    },
    onError: () =>
      toast({
        title: "Error",
        description: "This email is not whitelisted for beta access.",
        variant: "destructive",
      }),
  });

  const { mutate: verifyToken } = useVerifyEmailToken({
    data: {
      verifyEmailTokenDto: {
        email,
        token,
        isInviteFlow: true,
      },
    },
    onSuccess: async () => {
      try {
        const response = await fetch("/api/invite/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error("Failed to set cookie");
        }

        toast({
          title: "Success",
          description: "You're in!",
          variant: "success",
        });

        window.location.href = "/analytics";
      } catch {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Invalid verification code.",
        variant: "destructive",
      }),
  });

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-xl shadow-md">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to the Alumni FEUP Platform
            </h1>
            <p className="text-gray-500">
              {step === "email"
                ? "Enter your email to get started"
                : "Enter the verification code sent to your email"}
            </p>
          </div>

          {step === "email" ? (
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
              <Button
                onClick={() => verifyEmail()}
                disabled={!email}
                className="w-full bg-[#8C2D19] hover:bg-[#8C2D19] text-white transition-colors"
              >
                Get Verification Code
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter verification code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
              <Button
                onClick={() => verifyToken()}
                disabled={!token}
                className="w-full bg-[#8C2D19] hover:bg-[#8C2D19] text-white transition-colors"
              >
                Verify Code
              </Button>
              <button
                onClick={() => setStep("email")}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to email
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
