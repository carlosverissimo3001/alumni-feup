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
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You're in!",
        variant: "success",
      });
      window.location.href = "/analytics";
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Invalid verification code.",
        variant: "destructive",
      }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white/5 backdrop-blur-lg rounded-xl shadow-2xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">
              Welcome to the Alumni FEUP Platform
            </h1>
            <p className="text-gray-400">
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
                className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              <Button
                onClick={() => verifyEmail()}
                disabled={!email}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
                className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              <Button
                onClick={() => verifyToken()}
                disabled={!token}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Verify Code
              </Button>
              <button
                onClick={() => setStep("email")}
                className="w-full text-sm text-gray-400 hover:text-white transition-colors"
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
