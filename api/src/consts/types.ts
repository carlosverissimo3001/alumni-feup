export const ENROLLMENT_HEADERS = ['full_name', 'status', 'linkedin_url'];

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
