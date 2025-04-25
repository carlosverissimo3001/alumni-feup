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