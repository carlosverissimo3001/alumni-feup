import { FREQUENCY } from '../consts';
import { differenceInDays, subYears } from 'date-fns';

/**
 * Determines how many data points should be returned based on the start and end dates.
 * @param startDate - The start date of the data.
 * @param endDate - The end date of the data.
 * @returns The frequency of the data.
 */
export function determineFrequency(
  startDate?: string | Date,
  endDate?: string | Date,
): FREQUENCY {
  const now = new Date();
  const start = startDate
    ? new Date(startDate)
    : endDate
      ? new Date('2000-01-01')
      : subYears(now, 5);
  const end = endDate ? new Date(endDate) : now;

  const durationInDays = differenceInDays(end, start);
  // Note: Seeing weekly data wouldn't be too useful in my opinion
  // So if the user's range is not bigger than a year, we'll return monthly data
  if (durationInDays <= 366) return FREQUENCY.MONTHLY;
  if (durationInDays <= 3 * 365) return FREQUENCY.QUARTERLY;
  if (durationInDays <= 10 * 365) return FREQUENCY.SEMIANNUAL;

  return FREQUENCY.YEARLY;
}
