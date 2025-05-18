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

