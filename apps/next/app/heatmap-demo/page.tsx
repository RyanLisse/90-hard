'use client';

import React from 'react';
import HeatmapCalendar from '../components/HeatmapCalendar';

function generateDummyValues(): { date: string; count: number }[] {
  const values: { date: string; count: number }[] = [];
  const today = new Date();
  const start = new Date(today);
  start.setMonth(start.getMonth() - 3);
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    const count = Math.floor(Math.random() * 8); // 0..7
    values.push({ date: iso, count });
  }
  return values;
}

export default function HeatmapDemoPage() {
  const [values] = React.useState(generateDummyValues);

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="font-semibold text-2xl">HeatmapCalendar Demo</h1>
      <p className="text-gray-600 text-sm">
        Random demo data from the last ~3 months
      </p>
      <HeatmapCalendar
        hideColorLegend={false}
        showWeekdayLabels
        transformCountToBin={(c) => {
          if (c <= 0) return 0;
          if (c <= 2) return 1;
          if (c <= 4) return 2;
          if (c <= 6) return 3;
          return 4;
        }}
        values={values}
      />
    </main>
  );
}
