'use client';

import React from 'react';
import GitHubCalendar, { type ThemeInput } from 'react-github-calendar';

export type HeatmapValue = { date: string; count: number };

export type HeatmapCalendarProps = {
  values: HeatmapValue[];
  showWeekdayLabels?: boolean;
  hideColorLegend?: boolean;
  className?: string;
  theme?: {
    light: string[];
    dark: string[];
  };
  transformCountToBin?: (count: number) => number;
};

const defaultTheme: ThemeInput = {
  light: ['#f5f5f5', '#c6e48b', '#7bc96f', '#239a3b', '#196127'],
  dark: ['#0d1117', '#0e4429', '#006d32', '#26a641', '#39d353'],
};

export function HeatmapCalendar({
  values,
  showWeekdayLabels = true,
  hideColorLegend = false,
  className,
  theme,
  transformCountToBin,
}: HeatmapCalendarProps) {
  const mergedTheme: ThemeInput = theme ?? defaultTheme;

  const transformData = React.useCallback(
    (value: { date: string; count: number }) => {
      if (transformCountToBin) {
        return { ...value, count: transformCountToBin(value.count) };
      }
      return value;
    },
    [transformCountToBin]
  );

  return (
    <div className={className}>
      <GitHubCalendar
        hideColorLegend={hideColorLegend}
        showWeekdayLabels={showWeekdayLabels}
        theme={mergedTheme}
        transformData={transformData}
        values={values}
      />
    </div>
  );
}

export default HeatmapCalendar;
