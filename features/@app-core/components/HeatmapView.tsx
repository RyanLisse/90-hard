import React from 'react';
import GitHubCalendar from 'react-github-calendar';
import type { DayLog } from '../../../packages/domain/src/types';
import { computeDayCompletion } from '../../../packages/domain/src/types';
import { getColorForCompletion, getDateRange } from '../utils/heatmap';

interface HeatmapViewProps {
  logs: DayLog[];
  onDateClick?: (date: string) => void;
}

interface Activity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function HeatmapView({ logs, onDateClick }: HeatmapViewProps) {
  // Create a map of date strings to logs for quick lookup
  const logMap = new Map<string, DayLog>();
  logs.forEach((log) => {
    logMap.set(log.date, log);
  });

  // Get the date range for the heatmap
  const dateRange = getDateRange();

  // Convert logs to GitHub Calendar format
  const activities: Activity[] = dateRange.map((date) => {
    const dateStr = date.toISOString().split('T')[0];
    const log = logMap.get(dateStr);
    const completion = log ? computeDayCompletion(log) : 0;

    // Map completion percentage to GitHub's 0-4 level scale
    let level: Activity['level'] = 0;
    if (completion > 0 && completion <= 40) level = 1;
    else if (completion > 40 && completion <= 80) level = 2;
    else if (completion > 80 && completion < 100) level = 3;
    else if (completion === 100) level = 4;

    return {
      date: dateStr,
      count: completion,
      level,
    };
  });

  // Custom theme matching our color scheme
  const theme = {
    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  };

  // Custom tooltip content
  const renderTooltip = (value: Activity | null) => {
    if (!value) return null;

    const date = new Date(value.date);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const log = logMap.get(value.date);
    const tasks = log
      ? Object.entries(log.tasks).filter(([_, done]) => done)
      : [];

    return (
      <div className="max-w-xs rounded-md bg-gray-900 p-2 text-sm text-white">
        <div className="font-semibold">{dateStr}</div>
        <div className="mt-1">
          {value.count}% Complete ({tasks.length}/6 tasks)
        </div>
        {tasks.length > 0 && (
          <div className="mt-1 text-gray-300 text-xs">
            Completed: {tasks.map(([task]) => task).join(', ')}
          </div>
        )}
      </div>
    );
  };

  // Handle date clicks
  const handleClick = (activity: Activity) => {
    if (onDateClick) {
      onDateClick(activity.date);
    }
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900">
      <h3 className="mb-4 font-semibold text-gray-900 text-lg dark:text-white">
        77-Day Progress
      </h3>

      <div className="overflow-x-auto">
        <GitHubCalendar
          blockMargin={3}
          blockRadius={2}
          blockSize={13}
          data={activities} // Start on Sunday
          fontSize={12}
          hideColorLegend={false}
          hideTotalCount
          renderBlock={(block, activity) => (
            <rect
              {...block}
              aria-label={`${activity?.date}: ${activity?.count}% complete`}
              className="cursor-pointer hover:stroke-2 hover:stroke-gray-600"
              onClick={() => activity && handleClick(activity)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  activity && handleClick(activity);
                }
              }}
              role="button"
              tabIndex={0}
            />
          )}
          renderTooltip={renderTooltip}
          showWeekdayLabels
          theme={theme}
          weekStart={0}
        />
      </div>

      {/* Custom Legend */}
      <div className="mt-4 flex items-center justify-end space-x-2 text-gray-600 text-xs dark:text-gray-400">
        <span>Less</span>
        <div className="flex space-x-1">
          {theme.light.map((color, index) => (
            <div
              aria-label={`Level ${index}: ${index === 0 ? '0%' : index === 1 ? '1-40%' : index === 2 ? '41-80%' : index === 3 ? '81-99%' : '100%'}`}
              className="h-3 w-3 rounded-sm"
              key={index}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
