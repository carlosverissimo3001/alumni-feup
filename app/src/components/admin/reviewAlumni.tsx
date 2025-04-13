"use client";

import { Alumni } from "@/sdk";
import useMarkAlumniReviewed from "@/hooks/alumni/useMarkAlumniReviewed";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, PinIcon } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/misc/useToast";
import Image from "next/image";

const ReviewAlumni = ({ alumniToReview }: { alumniToReview: Alumni[] }) => {
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

  return (
    <div className="space-y-4">
      {alumniToReview.map((alumni) => (
        <Card key={alumni.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-lg flex items-center">
                    {alumni.fullName}
                    {alumni.linkedinUrl && (
                      <Link 
                        href={alumni.linkedinUrl}
                        target="_blank" 
                        className="ml-2 flex items-center text-primary hover:text-primary/80"
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
                </div>

                {alumni.Graduations && alumni.Graduations.length > 0 && (
                  <div className="space-y-1">
                    <div>
                      {alumni.Graduations.map((graduation, index) => (
                        <div 
                          key={index}
                          className="text-sm"
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
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReviewAlumni;

