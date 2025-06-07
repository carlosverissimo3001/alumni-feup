import NestAPI from "@/api";

export async function getCompanyInsights(id: string) {
    return await NestAPI.companyAnalyticsControllerGetCompanyDetails({ id });
}
