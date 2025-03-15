import { JobReturn } from 'src/consts';

export const getOperationStatus = (
  successCount: number,
  failureCount: number,
): JobReturn => {
  if (failureCount > 0) {
    return {
      status: 'error',
      message:
        'Some or all locations failed to update - Please review them manually -> `problematic_location` table',
    };
  }
  return {
    status: 'success',
    message: `Successfully updated all ${successCount} locations`,
  };
};
