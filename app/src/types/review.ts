  export type ReviewData = {
    id: string;
    name: string;
    linkedin_url?: string;
    profile_pic_url?: string;
    description?: string;
    upvotes?: string[];
    downvotes?: string[];
    rating?: number;
    companyName?: string;
    reviewType?: string;
    timeSincePosted?: number;
    timeSincePostedType?: string;
    createdAt?: Date | null;
  }

  export interface ReviewGeoJSONProperties {
    name: string[];
    reviews: number;
    alumniNames: { [key: string]: string };
    linkedinLinks: { [key: string]: string };
    profilePics: { [key: string]: string };
    descriptions: { [key: string]: string };
    ratings: { [key: string]: number };
    upvotes: { [key: string]: string[] };
    downvotes: { [key: string]: string[] };
    reviewTypes: { [key: string]: string };
    companyNames: { [key: string]: string };
    timeSincePosted: { [key: string]: number };
    timeSincePostedType: { [key: string]: string };
    createdAt: { [key: string]: Date | null };
  }
    