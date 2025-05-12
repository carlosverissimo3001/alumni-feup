import { Frequency } from './types';

export const getLabelForDate = (date: Date, freq?: Frequency): string => {
  const frequency = freq || Frequency.QUARTERLY;

  switch (frequency) {
    case Frequency.MONTHLY:
      return date.toISOString().slice(0, 7);
    case Frequency.QUARTERLY: {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const year = date.getFullYear();
      return `${year}-Q${quarter}`;
    }
    default:
      throw new Error(`Unsupported frequency: ${frequency}`);
  }
};
