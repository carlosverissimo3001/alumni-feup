export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ITEMS_PER_PAGE = [5, 10, 25, 50, 100];
export const DASHBOARD_HEIGHT = "h-[375px]";


export const ESCO_INFO = "https://esco.ec.europa.eu/en/classification/occupation_main"
export const ISCO_INFO = "https://esco.ec.europa.eu/en/about-esco/escopedia/escopedia/international-standard-classification-occupations-isco"

export enum SortBy {
  COUNT = 'count',
  // General, could be either company, industry, country...
  NAME = 'name',
  YEAR = 'year',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ViewType {
  TABLE = 'table',
  CHART = 'chart',
  TREND = 'trend',
}

export const SENIORITY_COLORS: Record<string, string> = {
  INTERN: "bg-blue-100 text-blue-800 border-blue-200",
  ENTRY_LEVEL: "bg-green-100 text-green-800 border-green-200",
  ASSOCIATE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  MID_SENIOR_LEVEL: "bg-purple-100 text-purple-800 border-purple-200",
  DIRECTOR: "bg-pink-100 text-pink-800 border-pink-200",
  EXECUTIVE: "bg-red-100 text-red-800 border-red-200",
  C_LEVEL: "bg-gray-200 text-gray-900 border-gray-300",
};
