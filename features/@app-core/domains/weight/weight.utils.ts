import type { WeightEntry } from './weight.types';

/**
 * Converts kilograms to pounds
 * @param kg - Weight in kilograms
 * @returns Weight in pounds rounded to 1 decimal place
 */
export const kgToLbs = (kg: number): number => {
  return +(kg * 2.204_622_621_8).toFixed(1);
};

/**
 * Converts pounds to kilograms
 * @param lbs - Weight in pounds
 * @returns Weight in kilograms rounded to 1 decimal place
 */
export const lbsToKg = (lbs: number): number => {
  return +(lbs / 2.204_622_621_8).toFixed(1);
};

/**
 * Calculates the difference between current and previous weight
 * @param current - Current weight
 * @param previous - Previous weight
 * @returns Weight delta (positive for gain, negative for loss)
 */
export const calculateWeightDelta = (
  current: number,
  previous?: number
): number => {
  if (previous === undefined) return 0;
  return +(current - previous).toFixed(1);
};

/**
 * Calculates moving average for weight entries
 * @param entries - Array of weight entries (should be sorted by date descending)
 * @param days - Number of days to average
 * @returns Moving average rounded to 1 decimal place
 */
export const calculateMovingAverage = (
  entries: WeightEntry[],
  days: number
): number => {
  if (entries.length === 0) return 0;

  // Take the most recent entries (from the end of the array if sorted chronologically)
  const startIndex = Math.max(0, entries.length - days);
  const recentEntries = entries.slice(startIndex, entries.length);
  const sum = recentEntries.reduce((total, entry) => total + entry.weight, 0);

  return +(sum / recentEntries.length).toFixed(1);
};

/**
 * Determines weight trend based on recent entries
 * @param entries - Array of weight entries (should be sorted by date descending)
 * @returns Trend direction: 'up', 'down', or 'stable'
 */
export const determineTrend = (
  entries: WeightEntry[]
): 'up' | 'down' | 'stable' => {
  if (entries.length < 2) return 'stable';

  // Entries should be in chronological order (oldest to newest)
  // Compare the last entry with the first entry
  const firstWeight = entries[0].weight;
  const lastWeight = entries[entries.length - 1].weight;

  const difference = lastWeight - firstWeight;

  // Consider trend stable if change is less than 0.5kg or ~1lb
  if (Math.abs(difference) < 0.5) return 'stable';

  return difference > 0 ? 'up' : 'down';
};
