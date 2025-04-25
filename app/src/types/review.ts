export type ReviewData = {
    name: string;
    linkedin_url?: string;
    profile_pic_url?: string;
    description?: string;
    upvotes?: number;
    downvotes?: number;
    rating?: number;
    companyName?: string;
    reviewType?: string;
    timeSincePosted?: number;
    timeSincePostedType?: string;
  }

  export interface ReviewGeoJSONProperties {
    name: string[];
    reviews: number;
    alumniNames: { [key: string]: string };
    linkedinLinks: { [key: string]: string };
    profilePics: { [key: string]: string };
    descriptions: { [key: string]: string };
    ratings: { [key: string]: number };
    upvotes: { [key: string]: number };
    downvotes: { [key: string]: number };
    reviewTypes: { [key: string]: string };
    companyNames: { [key: string]: string };
    timeSincePosted: { [key: string]: number };
    timeSincePostedType: { [key: string]: string };
  }
    