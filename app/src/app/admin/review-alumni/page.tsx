"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCheck } from "lucide-react";
import ReviewAlumni from "@/components/admin/reviewAlumni";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useListAlumniToReview } from "@/hooks/alumni/useListAlumniToReview";
import { Skeleton } from "@/components/ui/skeleton";
const ReviewAlumniPage = () => {
  const router = useRouter();

  const { data: alumniToReview, isLoading } = useListAlumniToReview();

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Review Alumni</h1>
            <p className="text-sm text-muted-foreground">
              Review and approve pending alumni submissions
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Review
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-full pb-2" />
              ) : (
                <div className="text-2xl font-bold pb-2">{alumniToReview?.length || 0}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Alumni waiting for approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>
              A list of alumni that have submitted their information for review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !alumniToReview ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                          <CardContent className="p-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <ReviewAlumni alumniToReview={alumniToReview} />
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReviewAlumniPage;
