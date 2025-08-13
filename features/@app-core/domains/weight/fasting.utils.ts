import type { FastingEntry, FastingStats } from './weight.types';

/**
 * Calculates the duration of a fast in hours
 * @param startTime - Fast start time in ISO format
 * @param endTime - Fast end time in ISO format (optional for ongoing fasts)
 * @param currentTime - Current time for calculating ongoing fast duration
 * @returns Duration in hours
 */
export const calculateFastingDuration = (
  startTime: string,
  endTime?: string,
  currentTime?: string
): number => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date(currentTime || Date.now());

  if (end < start) {
    return 0; // Invalid: end time before start time
  }

  const durationMs = end.getTime() - start.getTime();
  return Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10; // Round to 1 decimal
};

/**
 * Checks if a fast is currently active (no end time)
 * @param entry - Fasting entry to check
 * @returns True if fast is ongoing
 */
export const isActiveFast = (entry: FastingEntry): boolean => {
  return !entry.endTime;
};

/**
 * Calculates comprehensive fasting statistics
 * @param entries - Array of fasting entries (should be sorted by date)
 * @returns Fasting statistics
 */
export const calculateFastingStats = (
  entries: FastingEntry[]
): FastingStats => {
  if (entries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      weeklyAverage: 0,
      successRate: 0,
      totalFasts: 0,
      completedFasts: 0,
    };
  }

  const completedEntries = entries.filter(
    (entry) => entry.actualHours !== undefined
  );
  const completedFasts = completedEntries.length;
  const totalFasts = entries.length;

  // Calculate success rate (fasts that met or exceeded target)
  const successfulFasts = completedEntries.filter(
    (entry) => entry.actualHours >= entry.targetHours
  ).length;
  const successRate =
    completedFasts > 0
      ? +((successfulFasts / completedFasts) * 100).toFixed(1)
      : 0;

  // Calculate weekly average
  const totalHours = completedEntries.reduce(
    (sum, entry) => sum + entry.actualHours,
    0
  );
  const weeklyAverage =
    completedFasts > 0 ? +(totalHours / completedFasts).toFixed(1) : 0;

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Sort by date to calculate streaks properly
  const sortedEntries = [...entries].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  for (const entry of sortedEntries) {
    if (entry.actualHours && entry.actualHours >= entry.targetHours) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Current streak is from the end of the sorted array
  const reversedEntries = [...sortedEntries].reverse();
  for (const entry of reversedEntries) {
    if (entry.actualHours && entry.actualHours >= entry.targetHours) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    currentStreak,
    longestStreak,
    weeklyAverage,
    successRate,
    totalFasts,
    completedFasts,
  };
};

export interface FastingPattern {
  fastingHours: number;
  eatingHours: number;
  description: string;
}

/**
 * Parses fasting pattern string (e.g., "16:8") into structured data
 * @param pattern - Pattern string like "16:8", "18:6", etc.
 * @returns Parsed fasting pattern information
 */
export const parseFastingPattern = (pattern?: string): FastingPattern => {
  if (!pattern) {
    return {
      fastingHours: 0,
      eatingHours: 0,
      description: 'Unknown fasting pattern',
    };
  }

  const regex = /^(\d+):(\d+)$/;
  const match = regex.exec(pattern);
  if (!match) {
    return {
      fastingHours: 0,
      eatingHours: 0,
      description: 'Unknown fasting pattern',
    };
  }

  const fastingHours = Number.parseInt(match[1], 10);
  const eatingHours = Number.parseInt(match[2], 10);

  // Validate that hours add up to 24
  if (fastingHours + eatingHours !== 24) {
    return {
      fastingHours: 0,
      eatingHours: 0,
      description: 'Unknown fasting pattern',
    };
  }

  return {
    fastingHours,
    eatingHours,
    description: `${fastingHours} hour fast, ${eatingHours} hour eating window`,
  };
};
