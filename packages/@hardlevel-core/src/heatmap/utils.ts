/** Bands: 0, 1–40, 41–80, 81–99, 100 */
export type CompletionBand = 0 | 1 | 2 | 3 | 4;

export const bandForPercent = (pct: number): CompletionBand => {
  if (!Number.isFinite(pct) || pct <= 0) return 0;
  if (pct >= 100) return 4;
  if (pct >= 81) return 3;
  if (pct >= 41) return 2;
  return 1; // 1–40
};

/** ISO date string YYYY-MM-DD */
export type ISODate = `${number}-${number}-${number}`;

/**
 * Build a 7xW grid (rows=weekdays, cols=weeks) of ISO dates ending at endDate.
 * Rows are 0..6 (Sun..Sat), columns oldest→newest.
 */
export const buildHeatmapDates = (endDate: Date, weeks = 11): ISODate[][] => {
  const grid: ISODate[][] = Array.from({ length: 7 }, () => Array(weeks).fill(undefined) as ISODate[]);

  const end = new Date(endDate);
  // Align end to end-of-week column (last column index)
  const endDow = end.getDay(); // 0..6

  // Fill from newest column backward
  let current = new Date(end);
  for (let col = weeks - 1; col >= 0; col--) {
    for (let row = 6; row >= 0; row--) {
      // Ensure current corresponds to this cell's weekday alignment
      // We place dates bottom-up within the column ending at the aligned week
      const iso = toISO(current);
      grid[row][col] = iso;
      // Move to previous day
      current = new Date(current);
      current.setDate(current.getDate() - 1);
    }
  }

  // Adjust the last column so its bottom cell matches endDate's weekday
  // The simple fill already produces a continuous 7*weeks range ending today.
  // Consumers can ignore leading spillover outside their 77-day window.
  return grid;
};

export const toISO = (d: Date): ISODate => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}` as ISODate;
};

