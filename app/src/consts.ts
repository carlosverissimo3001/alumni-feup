export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ITEMS_PER_PAGE = [5, 10, 25, 50, 100];
export const DASHBOARD_HEIGHT = "h-[375px]";


export enum SortBy {
  ALUMNI_COUNT = 'alumniCount',
  COMPANY_COUNT = 'companyCount',
  // General, could be either company, industry, country...
  NAME = 'name',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

const RESEARCH_SERVICES_INDUSTRY_ID = '5ef5c029-b671-4957-b33d-28a959e4dd9c';
const HIGHER_EDUCATION_INDUSTRY_ID = 'b34884d6-fd6a-4931-9528-ed9330305beb';

export const EXCLUDED_INDUSTRIES = [
  RESEARCH_SERVICES_INDUSTRY_ID,
  HIGHER_EDUCATION_INDUSTRY_ID,
];

export const PORTUGAL_COUNTRY_CODE = 'PT';
