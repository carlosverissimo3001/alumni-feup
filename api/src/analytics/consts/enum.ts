export enum SORT_BY {
  COUNT = 'count',
  NAME = 'name',
  YEAR = 'year',
}

export enum SORT_ORDER {
  ASC = 'asc',
  DESC = 'desc',
}

export enum FREQUENCY {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMIANNUAL = 'semiannual',
  YEARLY = 'yearly',
}

export enum TREND_TYPE {
  ALUMNI_COUNT = 'alumniCount',
  COMPANY_COUNT = 'companyCount',
  ROLE_COUNT = 'roleCount',
}

export enum COMPANY_TYPE {
  EDUCATIONAL = 'EDUCATIONAL',
  GOVERNMENT_AGENCY = 'GOVERNMENT_AGENCY',
  NON_PROFIT = 'NON_PROFIT',
  PARTNERSHIP = 'PARTNERSHIP',
  PRIVATELY_HELD = 'PRIVATELY_HELD',
  PUBLIC_COMPANY = 'PUBLIC_COMPANY',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  SELF_OWNED = 'SELF_OWNED',
}

export enum GRADUATION_STATUS {
  ACTIVE = 'ACTIVE',
  GRADUATED = 'GRADUATED',
  DROPOUT = 'DROPOUT',
  EXTERNAL = 'EXTERNAL',
  NOT_ENROLLED = 'NOT_ENROLLED',
}

export enum COMPANY_SIZE {
  A = 'Not specified',
  B = '1-10 employees',
  C = '11-50 employees',
  D = '51-200 employees',
  E = '201-500 employees',
  F = '501-1000 employees',
  G = '1,001-5,000 employees',
  H = '5,001-10,000 employees',
  I = '10,001+ employees',
}

export enum SENIORITY_LEVEL {
  INTERN = 'INTERN',
  ENTRY_LEVEL = 'ENTRY_LEVEL',
  ASSOCIATE = 'ASSOCIATE',
  MID_SENIOR_LEVEL = 'MID_SENIOR_LEVEL',
  DIRECTOR = 'DIRECTOR',
  EXECUTIVE = 'EXECUTIVE',
  C_LEVEL = 'C_LEVEL',
}
