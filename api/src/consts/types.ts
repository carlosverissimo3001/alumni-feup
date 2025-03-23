export enum UPLOAD_TYPE {
  ENROLLMENT = 'ENROLLMENT',
  LINKEDIN = 'LINKEDIN',
}

export const ENROLLMENT_HEADERS = ['student_id', 'full_name', 'status'];

export const LINKEDIN_HEADERS = [
  // TODO: Define linkedin headers
];

export enum GRADUATION_STATUS {
  ACTIVE = 'ACTIVE',
  GRADUATED = 'GRADUATED',
  DROPOUT = 'DROPOUT',
  EXTERNAL = 'EXTERNAL',
  NOT_ENROLLED = 'NOT_ENROLLED',
}
