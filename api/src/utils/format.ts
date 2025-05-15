import { intervalToDuration } from 'date-fns';

/**
 * Converts decimal years to a human-readable string (e.g., "2 years and 6 months")
 * @param years - Number of years as a decimal
 * @returns Formatted string representing years and months
 */
export function formatYearsToHuman(years: number): string {
  if (!years || years <= 0) return '0 years';

  // Convert years to milliseconds
  const milliseconds = years * 365 * 24 * 60 * 60 * 1000;

  // Get duration parts
  const duration = intervalToDuration({
    start: new Date(0),
    end: new Date(milliseconds),
  });

  const { years: wholeYears, months } = duration;

  if (wholeYears && months) {
    return `${wholeYears} ${wholeYears === 1 ? 'year' : 'years'} and ${months} ${months === 1 ? 'month' : 'months'}`;
  }

  if (wholeYears) {
    return `${wholeYears} ${wholeYears === 1 ? 'year' : 'years'}`;
  }

  if (months) {
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }

  return '0 years';
}
