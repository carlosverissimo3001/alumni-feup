"use client"

import { useFetchPastLocationsAndCompanies } from "@/hooks/reviews/useFetchPastLocationsAndCompanies";
import { useState } from "react"
import { AlertCircle, Building2, MapPin, Star } from "lucide-react"
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
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";


type Errors = {
  reviewType?: string;
  reviewRating?: string;
  reviewText?: string;
  selectedCompany?: string;
  selectedLocation?: string;
};

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
    
    //Hardcoded Id for testing
    //const id = '49b4ffbe-e537-49c7-a14b-d5076c8af689';
    //const id = '144e0a9f-1cea-4da7-a6c2-6b0097a11e80';

    const { user } = useAuth();

    const {
        data: pastLocationsAndCompanies,
    } = useFetchPastLocationsAndCompanies(user?.id as string);

    const companies = transformData(pastLocationsAndCompanies?.companies);
    const locations = pastLocationsAndCompanies?.locations;
    
    const [hoveredRating, setHoveredRating] = useState(0);
    const [reviewType, setReviewType] = useState<string>('');
    const [description, setDescription] = useState("");
    const [reviewRating, setReviewRating] = useState(0);
    const [selectCompanyTransform, setSelectedCompanyTransform] = useState<string>('');
    const [selectedCompany, setSelectedCompanyDefault] = useState<string | undefined>(undefined);
    const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);
    const [errors, setErrors] = useState<Errors>({});

    const setSelectedCompany = (value: string) => {
      const index = Number(value);
      setSelectedCompanyTransform(value);
      setSelectedCompanyDefault(companies[index].companyId);
      setSelectedLocation(companies[index].locationId);
      setErrors((prev) => ({
        ...prev,
        selectedCompany: '',
      }));
    };

    const setSelectedLocationForm = (value: string) => {
      setSelectedLocation(value);
      setErrors((prev) => ({
        ...prev,
        selectedLocation: '',
      }));
    }

    const setReviewTypeFrom = (type: string) => {
      setReviewType(type);
      setSelectedCompanyTransform('');
      setSelectedCompanyDefault(undefined);
      setSelectedLocation(undefined);
    }

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

    const createReviewDto: CreateReviewDto = {
      alumniId: user?.id || '',
      description: description,
      rating: reviewRating,
      reviewType: reviewType,
      companyId: selectedCompany || '',
      locationId: selectedLocation || '',
    }

    const { mutate: sendReviewSubmit, error} = useReviewSubmit({
      data: createReviewDto,
      onSuccess,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }else{
        //createReviewDto.alumniId = user!.id;
        console.log(createReviewDto.alumniId);
        sendReviewSubmit();
        if(error){
          alert("Failed to submit review. Please try again.")
        }
      }
    };

    const validate = () => {
      const newErrors = {} as Errors;
      if(!reviewType) {
        newErrors.reviewType = 'Please select a review type.';
      }
      if(!reviewRating) {
        newErrors.reviewRating = 'Please select a rating.';
      }
      if(!description?.trim()) {
        newErrors.reviewText = 'Please enter your review.';
      }else if(description?.length < 10 || description?.length > 500) {
        newErrors.reviewText = 'Review must be between 10 and 500 characters.';
      }
      if(!selectedCompany && reviewType === ReviewType.Company) {
        newErrors.selectedCompany = 'Please select a company.';
      }
      if(!selectedLocation && reviewType === ReviewType.Location) {
        newErrors.selectedLocation = 'Please select a location.';
      }
      return newErrors;
    };

    const setRating = (rating: number) => {
        setReviewRating(rating);
        setErrors((prev) => ({
          ...prev,
          reviewRating: '',
        }));
    }

    const setReviewText = (text: string) => {
        if(text?.length < 10 || text?.length > 500) {
          setErrors((prev) => ({
            ...prev,
            reviewText: 'Review must be between 10 and 500 characters.',
          }));
        }else{
          setErrors((prev) => ({
            ...prev,
            reviewText: '',
          }));
        }
        setDescription(text);
    }

    const isFormValid = !reviewType || !reviewRating || !description?.trim() 
      || description?.length < 10 
      || description?.length > 500 
      || (!selectedCompany 
      && reviewType === ReviewType.Company)
      || (!selectedLocation 
      && reviewType === ReviewType.Location);
  
    return (
        <Card className="w-full max-w-2xl mx-auto mt-10">
        <CardHeader>
          <CardTitle>Write a Review {reviewType ? (isFormValid && (
                <div className="text-sm text-muted-foreground text-right float-end">
                  <span className="text-red-500">*</span> Required fields
                </div>)) : null}
          </CardTitle>
          <CardDescription>Share your experience about a company or location</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
            <Label className={errors.reviewType ? "text-red-500" : ""}>
              What are you reviewing?
            </Label>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="company"
                    name="reviewType"
                    value={ReviewType.Company}
                    className={`h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary ${
                      errors.reviewType ? "border-red-500" : ""
                    }`}
                    onClick={() => setReviewTypeFrom(ReviewType.Company)}
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
                    name="reviewType"
                    value={ReviewType.Location}
                    className={`h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary ${
                      errors.reviewType ? "border-red-500" : ""
                    }`}
                    onClick={() => setReviewTypeFrom(ReviewType.Location)}
                  />
                  <Label htmlFor="location" className="font-normal flex items-center gap-1.5 cursor-pointer">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Label>
                </div>
              </div>
              {errors.reviewType && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.reviewType}
              </p>
            )}
            </div>
  
            {reviewType && (
              <div className="space-y-2">
                <Label htmlFor="reviewType" className={errors.reviewType ? "text-red-500" : ""}>
                {reviewType ===  ReviewType.Company ? "Company Name" : "Location Name"}{" "}
                {((!selectedCompany && reviewType === ReviewType.Company) ||
                 (!selectedLocation && reviewType === ReviewType.Location)) && <span className="text-red-500">*</span>}
              </Label>
                {reviewType === ReviewType.Company ? (
                  <Select
                      value={selectCompanyTransform}
                      onValueChange={setSelectedCompany}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="The companies you have worked at" />
                      </SelectTrigger>
                      <SelectContent>            
                        {companies.length != 0 ?  companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                             {company.companyName}, {company.locationCity}, {company.locationCountry}
                          </SelectItem>
                        )) : (
                          <SelectItem value="0" disabled>
                            No companies available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>) : (
                      <Select
                      value={selectedLocation}
                      onValueChange={setSelectedLocationForm}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="The locations where you have worked" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations?.length != 0 ? locations?.map((location) => (
                          <SelectItem key={location.id} value={location.id!}>
                             {location.city}, {location.country}
                          </SelectItem>
                        )) : (
                          <SelectItem value="0" disabled>
                            No locations available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>)}
                
                  {errors.selectedCompany ? 
                  <p className="text-sm text-red-500">{errors.selectedCompany}</p> :
                    <p className="text-sm text-muted-foreground">
                    {reviewType === ReviewType.Company
                      ? "Select the company you're reviewing"
                      : "Select the location you're reviewing"}
                  </p>
                  }
              </div>
            )}
  
            {reviewType && (
              <div className="space-y-2">
                <Label className={errors.reviewRating ? "text-red-500" : ""}>
                Rating {!reviewRating && <span className="text-red-500">*</span>}
                </Label>
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
                          rating <= (hoveredRating || reviewRating)
                          ? "fill-amber-400 text-amber-400"
                          : errors.reviewRating
                            ? "text-red-300"
                            : "text-gray-300"
                        } transition-colors`}
                      />
                      <span className="sr-only">Rating {rating}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="hidden"
                />
                <p className="text-sm text-muted-foreground">How would you rate your experience?</p>
                {errors.reviewRating && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.reviewRating}
                </p>
              )}
              </div>
            )}
  
            {reviewType && (
              <div className="space-y-2">
                <Label htmlFor="reviewText" className={errors.reviewText ? "text-red-500" : ""}>
                  Your Review {!description.trim() && <span className="text-red-500">*</span>}
                </Label>
                <TextArea
                  id="reviewText"
                  placeholder="Share details about your experience..."
                  className={`min-h-[120px] resize-y ${errors.reviewText ? "border-red-500 focus:border-red-500" : ""}`}
                  onChange={(e) => setReviewText(e.target.value)}
                />
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Be honest and detailed in your review</p>
                  <p
                    className={`text-xs ${
                      (description?.length || 0) > 500
                        ? "text-red-500"
                        : (description?.length || 0) < 10
                          ? "text-red-500"
                          : "text-muted-foreground"
                    }`}
                  >
                    {description?.length || 0}/500
                  </p>
                </div>
                {errors.reviewText && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.reviewText}
                </p>
              )}
              </div>
            )}
              <Button type="submit" className="w-full" disabled={isFormValid}>
                Submit Review
              </Button>
          </form>
        </CardContent>
      </Card>
    )
}

export default SubmitReview;
