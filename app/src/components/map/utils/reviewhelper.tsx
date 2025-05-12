import { ReviewData, ReviewGeoJSONProperties } from "@/types/review";
import { Feature, Geometry } from "geojson";

import { extractJSONObjects } from "./helper";

export enum ReviewType {
    Company = "Company",
    Location = "Location",
}

/**
 * Builds the alumni data
 * @param listLinkedinLinks - The list of linkedin links
 * @param listAlumniNames - The list of alumni names
 * @param profilePics - The profile pics
 * @param mapUserCoursesYears - The map of user courses years
 */
export function buildReviewData(
    listReviewIds: string[],
    listAlumniNames: string[],
    linkedInLinks: { [key: string]: string },
    profilePics: { [key: string]: string },
    descriptions: { [key: string]: string },
    ratings: { [key: string]: number },
    upvotes: { [key: string]: number },
    downvotes: { [key: string]: number },
    reviewTypes: { [key: string]: string },
    companyNames: { [key: string]: string },
    timeSincePosted: { [key: string]: number },
    timeSincePostedType: { [key: string]: string },
  ): ReviewData[] {

    return listReviewIds.map((reviewId, index) => {
      return {
        id: reviewId,
        name: listAlumniNames[index],
        linkedin_url: linkedInLinks[reviewId],
        profile_pic_url: profilePics[reviewId],
        description: descriptions[reviewId],
        upvotes: upvotes[reviewId],
        downvotes: downvotes[reviewId],
        rating: ratings[reviewId],
        timeSincePosted: timeSincePosted[reviewId],
        timeSincePostedType: timeSincePostedType[reviewId],
        reviewType: reviewTypes[reviewId],
        companyName: companyNames[reviewId],
      };
    });
  }

  /**
 * Extracts the feature fields
 * @param feature - The feature to extract the fields from
 * @returns The extracted fields
 */
export async function extractReviewFeatureFields(
    feature: Feature<Geometry, ReviewGeoJSONProperties>
  ) {
    const listPlaceName = feature.properties.name;
    const reviews = feature.properties.reviews;
    const alumniNames = feature.properties.alumniNames;

    const profilePics = typeof feature.properties.profilePics === 'string'
      ? (await extractJSONObjects(feature.properties.profilePics))[0]
      : feature.properties.profilePics;

    // Handle linkUsersString directly as it's already an object
    const mapUserLinks =
      typeof alumniNames === "string"
        ? (await extractJSONObjects(alumniNames))[0]
        : alumniNames;

    const listReviewIds = Object.keys(mapUserLinks);

    const listAlumniNames = Object.values(mapUserLinks) as string[];

    const linkedInLinks = typeof feature.properties.linkedinLinks === 'string'
      ? (await extractJSONObjects(feature.properties.linkedinLinks))[0]
      : feature.properties.linkedinLinks;

    const descriptions = typeof feature.properties.descriptions === 'string'
      ? (await extractJSONObjects(feature.properties.descriptions))[0]
      : feature.properties.descriptions;

    const ratings = typeof feature.properties.ratings === 'string'
        ? (await extractJSONObjects(feature.properties.ratings))[0]
        : feature.properties.ratings;
    const upvotes = typeof feature.properties.upvotes === 'string'
        ? (await extractJSONObjects(feature.properties.upvotes))[0]
        : feature.properties.upvotes;
    const downvotes = typeof feature.properties.downvotes === 'string'
        ? (await extractJSONObjects(feature.properties.downvotes))[0]
        : feature.properties.downvotes;
    const reviewTypes = typeof feature.properties.reviewTypes === 'string'
        ? (await extractJSONObjects(feature.properties.reviewTypes))[0]
        : feature.properties.reviewTypes;
    const timeSincePosted = typeof feature.properties.timeSincePosted === 'string'
        ? (await extractJSONObjects(feature.properties.timeSincePosted))[0]
        : feature.properties.timeSincePosted;
    const timeSincePostedType = typeof feature.properties.timeSincePostedType === 'string'
        ? (await extractJSONObjects(feature.properties.timeSincePostedType))[0]
        : feature.properties.timeSincePostedType;
    const companyNames = typeof feature.properties.companyNames === 'string'
      ? (await extractJSONObjects(feature.properties.companyNames))[0]
      : feature.properties.companyNames;
  
    return {
        listPlaceName,
        reviews,
        listReviewIds,
        listAlumniNames,
        linkedInLinks,
        profilePics,
        descriptions,
        ratings,
        upvotes,
        downvotes,
        reviewTypes,
        timeSincePosted,
        timeSincePostedType,
        companyNames
    };
  }