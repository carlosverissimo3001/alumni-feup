"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user?.profilePictureUrl || "/placeholder-avatar.png"} alt="Profile" />
          <AvatarFallback>
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
          <div className="text-zinc-500 text-sm mt-1">{user?.currentRole || "Alumni"}</div>
        </div>
      </div>

      {/* At a glance card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>At a glance</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-8 flex-wrap">
          <div>
            <div className="text-lg font-semibold">{user?.currentRole || "-"}</div>
            <div className="text-xs text-zinc-500">Current Role</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{user?.currentCompany || "-"}</div>
            <div className="text-xs text-zinc-500">Current Company</div>
          </div>
          <div>
            <div className="text-lg font-semibold">--</div>
            <div className="text-xs text-zinc-500">Network at Company</div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for advanced insights */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cohort">Cohort</TabsTrigger>
          <TabsTrigger value="colleagues">Colleagues</TabsTrigger>
          <TabsTrigger value="insights">Industry Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="text-zinc-700 dark:text-zinc-300">Overview content coming soon...</div>
        </TabsContent>
        <TabsContent value="cohort">
          <div className="text-zinc-700 dark:text-zinc-300">Where are the people that graduated with you? (Coming soon)</div>
        </TabsContent>
        <TabsContent value="colleagues">
          <div className="text-zinc-700 dark:text-zinc-300">Where are the people that worked with you? (Coming soon)</div>
        </TabsContent>
        <TabsContent value="insights">
          <div className="text-zinc-700 dark:text-zinc-300">People with your YOE are working at these industries, companies... (Coming soon)</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}