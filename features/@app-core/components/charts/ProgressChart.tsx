import React from "react";
import type { TrendData, ChartDataPoint } from "../../domains/analytics/analytics.types";

interface ProgressChartProps {
  data: TrendData;
  title?: string;
  height?: number;
  showTrend?: boolean;
  color?: string;
  className?: string;
}

export function ProgressChart({
  data,
  title,
  height = 300,
  showTrend = true,
  color = "hsl(var(--primary))",
  className = "",
}: ProgressChartProps) {
  // TODO: Install recharts and implement with shadcn/ui Chart component
  // For now, return a placeholder that shows the expected structure
  
  const latestValue = data.points[data.points.length - 1]?.value || 0;
  const trendIndicator = data.trend === "up" ? "↗" : data.trend === "down" ? "↘" : "→";
  
  return (
    <div className={`w-full p-4 border rounded-lg ${className}`} style={{ height }}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {showTrend && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{trendIndicator}</span>
              <span>
                {data.trend} {Math.abs(data.trendPercentage).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-center h-full bg-muted/20 rounded">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color }}>
            {latestValue}%
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Current completion rate
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {data.points.length} data points
          </div>
        </div>
      </div>
      
      {/* TODO: Replace with actual recharts implementation */}
      <div className="mt-2 text-xs text-muted-foreground">
        Note: Install recharts and implement with shadcn/ui Chart component
      </div>
    </div>
  );
}

// Example usage:
export function CompletionTrendChart({ data }: { data: TrendData }) {
  return (
    <ProgressChart
      data={data}
      title="Completion Trend"
      showTrend={true}
      color="hsl(var(--chart-1))"
    />
  );
}

export function TaskSpecificChart({ 
  data, 
  taskName 
}: { 
  data: TrendData; 
  taskName: string;
}) {
  return (
    <ProgressChart
      data={data}
      title={`${taskName} Progress`}
      height={200}
      showTrend={true}
      color="hsl(var(--chart-2))"
    />
  );
}