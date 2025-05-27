/**
 * This class is responsible for listing the alumnis in a certain cluster. It also handles with Pagination
 */
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, MapPin, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { ReviewData } from "@/types/review";
import ImageWithFallback from "@/components/ui/image-with-fallback";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ReviewType } from "../utils/reviewhelper";
import { useChangeReviewScore } from "@/hooks/reviews/useChangeReviewScore";
import { ChangeReviewScoreDto } from "@/sdk/models";
import { useAuth } from "@/contexts/AuthContext";

type props = {
  hoveredCluster: boolean;
  listAlumniNames: string[];
  listLinkedinLinks: string[];
  listPlaceName: string[];
  hoveredMouseCoords: number[];
  reviewData: ReviewData[];
  scoreFetch: boolean;
  setScoreFetch: (scoreFetch: boolean) => void;
};

const ReviewClusterInfo = ({
  hoveredCluster,
  listPlaceName,
  hoveredMouseCoords,
  reviewData,
  setScoreFetch,
}: props) => {
  const nAlumniToShow = 10; // Defines the nº of alumnis to show when a hoover is preformed
  const [startPosition, setStartPosition] = useState(0); // Position in the array to start to read from
  const [endPosition, setEndPosition] = useState(nAlumniToShow - 1); // Position in the array to stop reading from. 0 is also a number therefore the -1
  const [showPrev, setShowPrev] = useState(false); // Defines if it is to show the "...Prev"
  const [showMore, setShowMore] = useState(false); // Defines if it is to show the "More..."
  const [reviewScore, setReviewScore] = useState<ChangeReviewScoreDto | null>(
    null
  );

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!hoveredCluster) {
      setStartPosition(0);
      setEndPosition(nAlumniToShow - 1);
    }
  }, [hoveredCluster]);

  // Defines the previous button of the listing when hoovering according to the startPosition value
  useEffect(() => {
    if (startPosition <= 0) {
      setShowPrev(false);
    } else {
      setShowPrev(true);
    }
  }, [startPosition]);

  // Defines the more button of the listing when hoovering according to the endPosition value
  useEffect(() => {
    if (endPosition >= reviewData.length - 1) {
      // endposition assumes a value bigger than the last arrays' position
      setShowMore(false);
    } else {
      setShowMore(true);
    }
  }, [reviewData.length, endPosition]);

  // Controls what should be done when the more button is pressed
  const handleShowMore = () => {
    setStartPosition(endPosition + 1);
    if (endPosition + nAlumniToShow > reviewData.length - 1) {
      setEndPosition(reviewData.length - 1); // Defaults to the array's last position
    } else {
      setEndPosition(endPosition + nAlumniToShow);
    }
    setShowPrev(true);
  };

  // Controls what should be done when the previous button is pressed
  const handleShowPrev = () => {
    setEndPosition(startPosition - 1);
    if (startPosition - nAlumniToShow < 0) {
      setStartPosition(0); // defaults to the first position of the array
    } else {
      setStartPosition(startPosition - nAlumniToShow);
    }
    setShowMore(true);
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
          }`}
        />
      ));
  };

  function handleHelpful(review: ReviewData, isHelpful: boolean) {
    if (user?.id && isAuthenticated) {
      const reviewScore: ChangeReviewScoreDto = {
        alumniId: user?.id,
        reviewId: review.id,
        upvote: isHelpful,
      };
      setReviewScore(reviewScore);
      sendChangeReviewScore();
      setScoreFetch(true);
      handleRealTimeScoreChange(review, isHelpful);
    }
  }

  function handleRealTimeScoreChange(review: ReviewData, isHelpful: boolean) {
    if (!user?.id) return;
    if (review.upvotes?.includes(user.id)) {
      review.upvotes = review.upvotes.filter((id) => id !== user.id);
      if (!isHelpful && review.downvotes) {
        review.downvotes.push(user.id);
      }
    } else if (review.downvotes?.includes(user.id)) {
      review.downvotes = review.downvotes.filter((id) => id !== user.id);
      if (isHelpful && review.upvotes) {
        review.upvotes.push(user.id);
      }
    } else if (isHelpful && review.upvotes) {
      review.upvotes.push(user.id);
    } else if (!isHelpful && review.downvotes) {
      review.downvotes.push(user.id);
    }
  }

  const { mutate: sendChangeReviewScore } = useChangeReviewScore({
    data: reviewScore!,
  });

  const getReviewTypeIcon = (type: string) => {
    return type === ReviewType.Company ? (
      <Building2 className="h-3.5 w-3.5" />
    ) : (
      <MapPin className="h-3.5 w-3.5" />
    );
  };

  return (
    <AnimatePresence>
      {hoveredCluster &&
      listPlaceName.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed z-50 w-[700px] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-4"
          style={{
            top: `${hoveredMouseCoords[1]}px`,
            left: `${hoveredMouseCoords[0]}px`,
          }}
        >
          {
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold tracking-wider text-red-700 uppercase mb-2">
                  Location
                </h3>
                <div className="flex flex-wrap gap-1">
                  {listPlaceName.map((place, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {place}
                    </Badge>
                  ))}
                </div>
              </div>
              <ScrollArea className="h-[350px] w-full rounded-md">
                <div className="w-full max-w-3xl mx-auto">
                  <div className="space-y-6">
                    {reviewData
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .slice(startPosition, endPosition + 1)
                      .map((review, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10 border">
                                <ImageWithFallback
                                  src={review.profile_pic_url ?? ""}
                                  alt={review.name}
                                />
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <div>
                                    <h3 className="font-semibold">
                                      {review.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                      <div className="flex">
                                        {renderStars(review.rating!)}
                                      </div>
                                      <span className="text-sm text-muted-foreground">
                                        • {review.timeSincePosted}{" "}
                                        {review.timeSincePostedType} ago
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground">
                                      Was this review helpful?
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`h-8 gap-1 ${
                                        review.upvotes?.includes(user?.id ?? "")
                                          ? "text-white bg-zinc-900"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        handleHelpful(review, true)
                                      }
                                    >
                                      <ThumbsUp className="h-3.5 w-3.5" />
                                      <span>{review.upvotes?.length}</span>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`h-8 gap-1 ${
                                        review.downvotes?.includes(
                                          user?.id ?? ""
                                        )
                                          ? "text-white bg-zinc-900"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        handleHelpful(review, false)
                                      }
                                    >
                                      <ThumbsDown className="h-3.5 w-3.5" />
                                      <span>{review.downvotes?.length}</span>
                                    </Button>
                                  </div>
                                </div>
                                <div className=" pt-3 rounded-md">
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <Badge
                                      variant="outline"
                                      className="flex items-center gap-1 px-2 py-0.5 h-5 text-xs font-normal"
                                    >
                                      {getReviewTypeIcon(review.reviewType!)}
                                      <span>
                                        {review.reviewType ===
                                        ReviewType.Company
                                          ? "Company"
                                          : "Location"}
                                      </span>
                                    </Badge>
                                    <h4 className="font-medium text-sm">
                                      {review.reviewType === ReviewType.Company
                                        ? review.companyName
                                        : ""}
                                    </h4>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {review.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              </ScrollArea>

              <div className="flex justify-between pt-2">
                {showPrev && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowPrev}
                    className="text-xs"
                  >
                    ← Previous
                  </Button>
                )}
                {showMore && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowMore}
                    className="text-xs ml-auto"
                  >
                    More →
                  </Button>
                )}
              </div>
            </div>
          }
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ReviewClusterInfo;
