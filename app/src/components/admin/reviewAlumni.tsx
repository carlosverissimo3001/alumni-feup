"use client";

import { AlumniExtended } from "@/sdk";
import { useMarkAlumniReviewed } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, PinIcon, ClockIcon } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/misc/useToast";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { CldImage } from 'next-cloudinary';


const ReviewAlumni = ({ alumniToReview }: { alumniToReview: AlumniExtended[] }) => {
  const { toast } = useToast();
  const { mutate: markAsReviewed, isPending: isMarkingAsReviewed } = useMarkAlumniReviewed({
    onSuccess: () => {
      toast({
        title: "Alumni marked as reviewed",
        description: "The alumni has been marked as reviewed",
        variant: "success",
      });
    }
  });

  if (!alumniToReview?.length) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No pending alumni to review
      </div>
    );
  }

  // Function to check if a date is less than 24 hours ago
  const isRecent = (date: string | Date) => {
    return new Date().getTime() - new Date(date).getTime() < 86400000; // 24 hours in milliseconds
  };

  return (
    <div className="space-y-4">
      {alumniToReview.map((alumni) => (
        <Card key={alumni.id} className="transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                    {alumni.profilePictureUrl ? (
                      <CldImage
                        src={alumni.profilePictureUrl}
                        alt={`${alumni.fullName}'s profile picture`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        {alumni.fullName?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg flex items-center">
                      {alumni.fullName}
                      {alumni.linkedinUrl && (
                        <Link 
                          href={alumni.linkedinUrl}
                          target="_blank" 
                          className="ml-2 flex items-center text-primary hover:scale-110 transition-transform"
                          title="View LinkedIn Profile"
                        >
                          <Image 
                            src="/logos/linkedin-icon.svg" 
                            alt="LinkedIn" 
                            width={16} 
                            height={16} 
                          />
                        </Link>
                      )}
                    </h3>
                    {alumni.Location && alumni.Location.city && alumni.Location.country && (
                      <div className="flex items-center gap-2 text-sm">
                        <PinIcon className="h-4 w-4 text-red-500" strokeWidth={2} />
                        <span className="text-muted-foreground">
                          {String(alumni.Location.city)}, {String(alumni.Location.country)}
                        </span>
                      </div>
                    )}
                    
                    {alumni.createdAt && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>Submitted {formatDistanceToNow(new Date(alumni.createdAt))} ago</span>
                        {isRecent(alumni.createdAt) && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">New</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {alumni.Graduations && alumni.Graduations.length > 0 && (
                  <div className="space-y-1">
                    <div className="space-y-2">
                      {alumni.Graduations.map((graduation, index) => (
                        <div 
                          key={index}
                          className="text-sm border-l-2 border-muted pl-2"
                        >
                          <span className="font-medium">{graduation.Course.name.toString()}</span>
                          <span className="text-muted-foreground"> ({graduation.conclusionYear.toString()})</span>
                          <div className="text-xs text-muted-foreground">{graduation.Course.acronym.toString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                size="sm"
                className="ml-4"
                onClick={() => markAsReviewed({ id: alumni.id })}
                disabled={isMarkingAsReviewed}
              >
                {isMarkingAsReviewed ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReviewAlumni;

