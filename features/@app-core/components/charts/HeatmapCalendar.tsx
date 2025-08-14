import React from "react";
import GitHubCalendar from "react-github-calendar";
import type { TaskCompletionData } from "../../domains/analytics/analytics.types";

interface HeatmapCalendarProps {
  data: TaskCompletionData[];
  username?: string;
  year?: number;
  showWeekdayLabels?: boolean;
  showMonthLabels?: boolean;
  blockSize?: number;
  blockMargin?: number;
  theme?: "light" | "dark";
  className?: string;
}

interface GitHubCalendarData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function HeatmapCalendar({
  data,
  username = "90-hard-user",
  year,
  showWeekdayLabels = true,
  showMonthLabels = true,
  blockSize = 12,
  blockMargin = 2,
  theme = "light",
  className = "",
}: HeatmapCalendarProps) {
  // Transform completion data to GitHub calendar format
  const transformToGitHubFormat = (
    completionData: TaskCompletionData[],
  ): GitHubCalendarData[] => {
    return completionData.map((day) => {
      // Convert completion percentage to GitHub-style levels (0-4)
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      
      if (day.completionPercentage === 0) level = 0;
      else if (day.completionPercentage <= 25) level = 1;
      else if (day.completionPercentage <= 50) level = 2;
      else if (day.completionPercentage <= 75) level = 3;
      else level = 4;

      return {
        date: day.date,
        count: day.completedTasks,
        level,
      };
    });
  };

  const calendarData = transformToGitHubFormat(data);

  // Custom theme for 90-hard app
  const customTheme = {
    light: {
      level0: "#ebedf0",
      level1: "#9be9a8",
      level2: "#40c463",
      level3: "#30a14e",
      level4: "#216e39",
    },
    dark: {
      level0: "#161b22",
      level1: "#0e4429",
      level2: "#006d32",
      level3: "#26a641",
      level4: "#39d353",
    },
  };

  const transformData = (contributions: any[]) => {
    // Map our custom data to the expected format
    return calendarData.map((item) => ({
      date: item.date,
      count: item.count,
      level: item.level,
    }));
  };

  const currentYear = year || new Date().getFullYear();

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Daily Progress Heatmap</h3>
        <p className="text-sm text-muted-foreground">
          Track your daily completion patterns over time
        </p>
      </div>

      <div className="overflow-x-auto">
        <GitHubCalendar
          username={username}
          year={currentYear}
          transformData={transformData}
          theme={customTheme}
          colorScheme={theme}
          blockSize={blockSize}
          blockMargin={blockMargin}
          fontSize={12}
          showWeekdayLabels={showWeekdayLabels}
          hideColorLegend={false}
          hideMonthLabels={!showMonthLabels}
          hideTotalCount={false}
          labels={{
            months: [
              "Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ],
            weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            totalCount: "{{count}} completions in {{year}}",
            legend: {
              less: "Less",
              more: "More",
            },
          }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">
            {data.filter(d => d.completionPercentage === 100).length}
          </div>
          <div className="text-muted-foreground">Perfect Days</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">
            {data.filter(d => d.completionPercentage > 0).length}
          </div>
          <div className="text-muted-foreground">Active Days</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600">
            {Math.round(
              data.reduce((sum, d) => sum + d.completionPercentage, 0) / 
              Math.max(data.length, 1)
            )}%
          </div>
          <div className="text-muted-foreground">Avg Completion</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-orange-600">
            {calculateCurrentStreak(data)}
          </div>
          <div className="text-muted-foreground">Current Streak</div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate current streak
function calculateCurrentStreak(data: TaskCompletionData[]): number {
  if (data.length === 0) return 0;

  const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;

  for (const day of sorted) {
    if (day.completionPercentage > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Specialized components for different use cases
export function YearlyHeatmap({ 
  data, 
  year 
}: { 
  data: TaskCompletionData[]; 
  year?: number;
}) {
  return (
    <HeatmapCalendar
      data={data}
      year={year}
      blockSize={10}
      className="bg-card rounded-lg p-4 border"
    />
  );
}

export function CompactHeatmap({ 
  data 
}: { 
  data: TaskCompletionData[];
}) {
  return (
    <HeatmapCalendar
      data={data}
      blockSize={8}
      blockMargin={1}
      showWeekdayLabels={false}
      showMonthLabels={false}
      className="bg-card rounded-lg p-2 border"
    />
  );
}