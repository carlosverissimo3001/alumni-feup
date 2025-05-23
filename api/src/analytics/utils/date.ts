import { FREQUENCY } from '../consts';

export const getLabelForDate = (date: Date, freq?: FREQUENCY): string => {
  const frequency = freq || FREQUENCY.QUARTERLY;

  switch (frequency) {
    case FREQUENCY.YEARLY:
      return date.getFullYear().toString();
    case FREQUENCY.MONTHLY:
      return date.toISOString().slice(0, 7);
    case FREQUENCY.QUARTERLY: {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const year = date.getFullYear();
      return `${year}-Q${quarter}`;
    }
    default:
      throw new Error(`Unsupported frequency: ${frequency}`);
  }
};
