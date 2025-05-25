"use client";

import { useState } from "react";
import { useInviteUser } from "@/hooks/admin/useInviteUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/misc/useToast";

export default function AddBetaTester() {
  const [singleEmail, setSingleEmail] = useState("");
  const [batchEmails, setBatchEmails] = useState("");
  const { toast } = useToast();
  const { mutate: inviteUser, isLoading } = useInviteUser();

  const handleSingleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleEmail) {
      toast({
        title: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      inviteUser({
        inviteUserDto: {
          email: singleEmail.trim(),
        },
      });
      toast({
        title: `Invitation sent to ${singleEmail}`,
        variant: "success",
      });
      setSingleEmail("");
    } catch {
      toast({
        title: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const handleBatchInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchEmails) {
      toast({
        title: "Please enter email addresses",
        variant: "destructive",
      });
      return;
    }

    const emails = batchEmails
      .split("\n")
      .map((email) => email.trim())
      .filter((email) => email !== "");

    if (emails.length === 0) {
      toast({
        title: "No valid emails found",
        variant: "destructive",
      });
      return;
    }

    try {
      const invitePromises = emails.map(async (email) => {
        try {
          await inviteUser({
            inviteUserDto: {
              email,
            },
          });
        } catch {
          toast({
            title: `Failed to send invitation to ${email}`,
            variant: "destructive",
          });
        }
      });
      await Promise.all(invitePromises);
      
      toast({
        title: `Invitations sent to ${emails.length} users`,
        variant: "success",
      });
      setBatchEmails("");
    } catch {
      toast({
        title: "Failed to send some invitations",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Invite Beta Testers</h1>

      <Card>
        <CardHeader>
          <CardTitle>Send Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single" className="w-full">
            <TabsList>
              <TabsTrigger value="single">Single Invite</TabsTrigger>
              <TabsTrigger value="batch">Batch Invite</TabsTrigger>
            </TabsList>

            <TabsContent value="single">
              <form onSubmit={handleSingleInvite} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={singleEmail}
                    onChange={(e) => setSingleEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Invitation"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="batch">
              <form onSubmit={handleBatchInvite} className="space-y-4">
                <div>
                  <label
                    htmlFor="batch-emails"
                    className="block text-sm font-medium mb-2"
                  >
                    Email Addresses (one per line)
                  </label>
                  <Textarea
                    id="batch-emails"
                    placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                    value={batchEmails}
                    onChange={(e) => setBatchEmails(e.target.value)}
                    rows={6}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Invitations"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
