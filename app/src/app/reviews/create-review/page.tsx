"use client"

import { useFetchPastLocationsAndCompanies } from "@/hooks/reviews/useFetchPastLocationsAndCompanies";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Building2, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/misc/useToast";
import { useRouter } from "next/navigation";

import { TextArea } from "@/components/ui/text-area";
import { Label } from "@/components/ui/label";
import { ReviewType } from "@/components/map/utils/reviewhelper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReviewSubmit } from "@/hooks/reviews/useReviewSubmit";
import { CreateReviewDto } from "@/sdk/models/CreateReviewDto";
import { ExtendedCompanyDto } from "@/sdk/models/ExtendedCompanyDto";


interface FormValues {
  reviewType: ReviewType
  subjectName: string
  rating: string
  reviewText: string
}

interface CompanyTransformed {
    id: string;
    companyId: string | undefined;
    companyName: string | undefined;
    locationId: string | undefined;
    locationCity: string | undefined;
    locationCountry: string | undefined;
}

const SubmitReview = () => {
    const { toast } = useToast();
    const router = useRouter();
    //const { id } = '49b4ffbe-e537-49c7-a14b-d5076c8af689';//useParams();
    //Hardcoded Id for testing
    const id = '49b4ffbe-e537-49c7-a14b-d5076c8af689';

    const {
        data: pastLocationsAndCompanies,
        isLoading,
        error,
    } = useFetchPastLocationsAndCompanies(id as string);

    const { user, isAuthenticated } = useAuth();
    const isOwnProfile = user?.id === id;

    const companies = transformData(pastLocationsAndCompanies?.Companies);
    const locations = pastLocationsAndCompanies?.Locations;
    
    const [hoveredRating, setHoveredRating] = useState(0);
    // Form state
    const [reviewType, setReviewType] = useState<string>('');
    const [description, setDescription] = useState("");
    const [reviewRating, setReviewRating] = useState(0);
    const [selectCompanyTransform, setSelectedCompanyTransform] = useState<string>('');
    const [selectedCompany, setSelectedCompanyDefault] = useState<string | undefined>(undefined);
    const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);

  // const isFormValid = () => {
  //   return (
  //       description.trim() !== "" 
  //       // rating > 0 &&
  //       // rating <= 5  
  //   );
  // };

  const setSelectedCompany = (value: string) => {
    const index = Number(value);
    setSelectedCompanyTransform(value);
    setSelectedCompanyDefault(companies[index].companyId);
    setSelectedLocation(companies[index].locationId);
  };

  function transformData(companies?: ExtendedCompanyDto[]): CompanyTransformed[] {
    return (companies || []).map((company, index) => ({
      id: String(index),
      companyId: company.id,
      companyName: company.name,
      locationId: company.location?.id,
      locationCity: company.location?.city,
      locationCountry: company.location?.country,
    }));
  }

    const {
      register,
      //handleSubmit,
      watch,
      reset,
      setValue,
      formState: { errors },
    } = useForm<FormValues>({
      defaultValues: {
        subjectName: "",
        reviewText: "",
      },
    })
  
    function onSubmit() {
      sendReviewSubmit();
      reset();
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setDescription(watch("reviewText"));
      setReviewType(watch("reviewType").toString());
      console.log("onSubmit ", watch("reviewText"));
      sendReviewSubmit();
      reset();
    };

    const onSuccess = () => {
      toast({
        title: "Success!",
        description: `Your review has been received.`,
        duration: 3000,
        variant: "success",
      });
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }

    const watchReviewType = watch("reviewType");
    const watchReviewText = watch("reviewText");
    const watchRating = watch("rating");
    const selectedRating = watchRating ? Number.parseInt(watchRating) : 0

    const createReviewDto: CreateReviewDto = {
      alumniId: id,
      description: description,
      rating: reviewRating,
      reviewType: reviewType,
      companyId: selectedCompany || '',
      locationId: selectedLocation || '',
    }

    const { mutate: sendReviewSubmit, isPending } = useReviewSubmit({
      data: createReviewDto,
      onSuccess,
    });

    const setRating = (rating: number) => {
      setReviewRating(rating);
      setValue("rating", rating.toString(), { shouldValidate: true })
    }
  
    return (
        <Card className="w-full max-w-2xl mx-auto mt-10">
        <CardHeader>
          <CardTitle>Write a Review</CardTitle>
          <CardDescription>Share your experience about a company or location</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label>What are you reviewing?</Label>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="company"
                    value={ReviewType.Company}
                    className="h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary"
                    {...register("reviewType", {
                      required: "Please select what you're reviewing",
                    })}
                  />
                  <Label htmlFor="company" className="font-normal flex items-center gap-1.5 cursor-pointer">
                    <Building2 className="h-4 w-4" />
                    Company
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="location"
                    value={ReviewType.Location}
                    className="h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary"
                    {...register("reviewType", {
                      required: "Please select what you're reviewing",
                    })}
                  />
                  <Label htmlFor="location" className="font-normal flex items-center gap-1.5 cursor-pointer">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Label>
                </div>
              </div>
              {errors.reviewType && <p className="text-sm text-red-500">{errors.reviewType.message}</p>}
            </div>
  
            {watchReviewType && (
              <div className="space-y-2">
                <Label htmlFor="subjectName">{watchReviewType === ReviewType.Company ? "Company Name" : "Location Name"}</Label>
                {watchReviewType === ReviewType.Company ? (
                  <Select
                      value={selectCompanyTransform}
                      onValueChange={setSelectedCompany}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="The companies you have worked at" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies?.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                             {company.companyName}, {company.locationCity}, {company.locationCountry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>) : (
                      <Select
                      value={selectedLocation}
                      onValueChange={setSelectedLocation}
                      //disabled={isLoadingFaculties}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="The locations where you have worked" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations?.map((location) => (
                          <SelectItem key={location.id} value={location.id!}>
                             {location.city}, {location.country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>)}
                <p className="text-sm text-muted-foreground">
                  {watchReviewType === ReviewType.Company
                    ? "Select the company you're reviewing"
                    : "Select the location you're reviewing"}
                </p>
                {errors.subjectName && <p className="text-sm text-red-500">{errors.subjectName.message}</p>}
              </div>
            )}
  
            {watchReviewType && (
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setRating(rating)}
                      onMouseEnter={() => setHoveredRating(rating)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          rating <= (hoveredRating || selectedRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                        } transition-colors`}
                      />
                      <span className="sr-only">Rating {rating}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="hidden"
                  {...register("rating", {
                    required: "Please select a rating.",
                  })}
                />
                <p className="text-sm text-muted-foreground">How would you rate your experience?</p>
                {errors.rating && <p className="text-sm text-red-500">{errors.rating.message}</p>}
              </div>
            )}
  
            {watchReviewType && (
              <div className="space-y-2">
                <Label htmlFor="reviewText">Your Review</Label>
                <TextArea
                  id="reviewText"
                  placeholder="Share details about your experience..."
                  className="min-h-[120px] resize-y"
                  //onChange={(e) => setDescription(e.target.value)}
                  {...register("reviewText", {
                    required: "Review text is required",
                    minLength: {
                      value: 10,
                      message: "Review must be at least 10 characters.",
                    },
                    maxLength: {
                      value: 500,
                      message: "Review cannot exceed 500 characters.",
                    },
                  })}
                />
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Be honest and detailed in your review</p>
                  <p
                    className={`text-xs ${watch("reviewText")?.length > 500 ? "text-red-500" : "text-muted-foreground"}`}
                  >
                    {watch("reviewText")?.length || 0}/500
                  </p>
                </div>
                {errors.reviewText && <p className="text-sm text-red-500">{errors.reviewText.message}</p>}
              </div>
            )}
  
            <Button type="submit" className="w-full" disabled={!watchReviewType}>
              Submit Review
            </Button>
          </form>
        </CardContent>
      </Card>
    )
}

export default SubmitReview;