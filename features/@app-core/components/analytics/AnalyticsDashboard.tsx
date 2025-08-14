import React, { useState, useEffect } from "react";
import { ProgressChart, CompletionTrendChart, TaskSpecificChart } from "../charts/ProgressChart";
import { HeatmapCalendar, YearlyHeatmap } from "../charts/HeatmapCalendar";
import type { 
  UserAnalytics, 
  TimeRange, 
  AnalyticsInsight,
  ComparisonStats 
} from "../../domains/analytics/analytics.types";
import type { GamificationStats } from "../../domains/gamification/gamification.types";

interface AnalyticsDashboardProps {
  userId: string;
  analytics: UserAnalytics;
  gamificationStats: GamificationStats;
  comparison?: ComparisonStats;
  onTimeRangeChange: (timeRange: TimeRange) => void;
  onExportData: (format: "CSV" | "JSON") => void;
  className?: string;
}

export function AnalyticsDashboard({
  userId,
  analytics,
  gamificationStats,
  comparison,
  onTimeRangeChange,
  onExportData,
  className = "",
}: AnalyticsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(analytics.timeRange);
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "gamification" | "insights">("overview");

  const handleTimeRangeChange = (timeRange: TimeRange) => {
    setSelectedTimeRange(timeRange);
    onTimeRangeChange(timeRange);
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header with Time Range Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your progress and insights for the 90-hard challenge
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <TimeRangeSelector
            selected={selectedTimeRange}
            onChange={handleTimeRangeChange}
          />
          <ExportDropdown onExport={onExportData} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "tasks", label: "Task Breakdown" },
            { id: "gamification", label: "Gamification" },
            { id: "insights", label: "Insights" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab 
          analytics={analytics} 
          gamificationStats={gamificationStats}
          comparison={comparison} 
        />
      )}
      
      {activeTab === "tasks" && (
        <TasksTab analytics={analytics} />
      )}
      
      {activeTab === "gamification" && (
        <GamificationTab 
          gamificationStats={gamificationStats}
          analytics={analytics}
        />
      )}
      
      {activeTab === "insights" && (
        <InsightsTab insights={analytics.insights} />
      )}
    </div>
  );
}

// Time Range Selector Component
function TimeRangeSelector({ 
  selected, 
  onChange 
}: { 
  selected: TimeRange; 
  onChange: (range: TimeRange) => void;
}) {
  const ranges: { value: TimeRange; label: string }[] = [
    { value: "7D", label: "7 Days" },
    { value: "30D", label: "30 Days" },
    { value: "90D", label: "90 Days" },
    { value: "ALL", label: "All Time" },
  ];

  return (
    <div className="flex rounded-md border">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`px-3 py-2 text-sm font-medium first:rounded-l-md last:rounded-r-md ${
            selected === range.value
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

// Export Dropdown Component
function ExportDropdown({ onExport }: { onExport: (format: "CSV" | "JSON") => void }) {
  return (
    <div className="relative">
      <select
        onChange={(e) => {
          if (e.target.value) {
            onExport(e.target.value as "CSV" | "JSON");
            e.target.value = "";
          }
        }}
        className="px-3 py-2 border rounded-md bg-background text-sm"
        defaultValue=""
      >
        <option value="" disabled>Export</option>
        <option value="CSV">Export CSV</option>
        <option value="JSON">Export JSON</option>
      </select>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ 
  analytics, 
  gamificationStats,
  comparison 
}: { 
  analytics: UserAnalytics;
  gamificationStats: GamificationStats;
  comparison?: ComparisonStats;
}) {
  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Current Streak"
          value={analytics.periodStats.currentStreak}
          unit="days"
          trend={comparison?.improvements.currentStreak}
          color="text-green-600"
        />
        <MetricCard
          title="Average Completion"
          value={analytics.periodStats.averageCompletion}
          unit="%"
          trend={comparison?.improvements.averageCompletion}
          color="text-blue-600"
        />
        <MetricCard
          title="Perfect Days"
          value={analytics.periodStats.perfectDays}
          unit="days"
          trend={comparison?.improvements.perfectDays}
          color="text-purple-600"
        />
        <MetricCard
          title="Current Level"
          value={gamificationStats.currentLevel}
          unit={`(${gamificationStats.rank} Rank)`}
          color="text-orange-600"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <CompletionTrendChart data={analytics.completionTrend} />
        </div>
        
        <div className="border rounded-lg p-4">
          <YearlyHeatmap 
            data={analytics.completionTrend.points.map(point => ({
              date: point.date,
              workout1: true, // TODO: Get actual task data
              workout2: true,
              diet: true,
              water: true,
              reading: true,
              photo: true,
              completionPercentage: point.value,
              totalTasks: 6,
              completedTasks: Math.round((point.value / 100) * 6),
            }))}
          />
        </div>
      </div>
    </div>
  );
}

// Tasks Tab Component
function TasksTab({ analytics }: { analytics: UserAnalytics }) {
  const tasks = ["workout1", "workout2", "diet", "water", "reading", "photo"];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map((task) => (
          <div key={task} className="border rounded-lg p-4">
            <TaskSpecificChart
              data={analytics.taskTrends[task]}
              taskName={task.charAt(0).toUpperCase() + task.slice(1)}
            />
          </div>
        ))}
      </div>

      {/* Task Breakdown Table */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Task Completion Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Task</th>
                <th className="text-right py-2">Completed</th>
                <th className="text-right py-2">Rate</th>
                <th className="text-right py-2">Trend</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const completed = analytics.periodStats.taskBreakdown[task] || 0;
                const rate = Math.round((completed / analytics.periodStats.totalDays) * 100);
                const trend = analytics.taskTrends[task]?.trend || "stable";
                
                return (
                  <tr key={task} className="border-b">
                    <td className="py-2 font-medium capitalize">{task}</td>
                    <td className="text-right py-2">{completed}</td>
                    <td className="text-right py-2">{rate}%</td>
                    <td className="text-right py-2">
                      <span className={`inline-flex items-center gap-1 ${
                        trend === "up" ? "text-green-600" : 
                        trend === "down" ? "text-red-600" : "text-muted-foreground"
                      }`}>
                        {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"}
                        {trend}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Gamification Tab Component
function GamificationTab({ 
  gamificationStats,
  analytics 
}: { 
  gamificationStats: GamificationStats;
  analytics: UserAnalytics;
}) {
  return (
    <div className="space-y-6">
      {/* Gamification Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total XP"
          value={gamificationStats.totalXP}
          unit="XP"
          color="text-yellow-600"
        />
        <MetricCard
          title="Achievements"
          value={gamificationStats.achievementsUnlocked}
          unit={`of ${gamificationStats.totalAchievements}`}
          color="text-purple-600"
        />
        <MetricCard
          title="Badges Earned"
          value={gamificationStats.badgesEarned}
          unit="badges"
          color="text-blue-600"
        />
      </div>

      {/* Level Progress */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Level Progress</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">Level {gamificationStats.currentLevel}</span>
            <span className="text-lg font-medium text-muted-foreground">
              Rank {gamificationStats.rank}
            </span>
          </div>
          
          {/* Progress Bar Placeholder */}
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: "65%" }} // TODO: Calculate actual progress
            />
          </div>
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Current XP: {gamificationStats.totalXP}</span>
            <span>Next Level: 1,200 XP</span> {/* TODO: Calculate from actual level thresholds */}
          </div>
        </div>
      </div>
    </div>
  );
}

// Insights Tab Component
function InsightsTab({ insights }: { insights: AnalyticsInsight[] }) {
  return (
    <div className="space-y-4">
      {insights.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No insights available yet.</p>
          <p className="text-sm">Keep tracking your progress to get personalized insights!</p>
        </div>
      ) : (
        insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))
      )}
    </div>
  );
}

// Reusable Components
function MetricCard({ 
  title, 
  value, 
  unit, 
  trend, 
  color = "text-foreground" 
}: {
  title: string;
  value: number;
  unit?: string;
  trend?: number;
  color?: string;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className={`text-2xl font-bold ${color}`}>
        {value}
        {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
      </div>
      {trend !== undefined && (
        <div className={`text-sm ${trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-muted-foreground"}`}>
          {trend > 0 ? "+" : ""}{trend} vs previous period
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight }: { insight: AnalyticsInsight }) {
  const getIconForType = (type: AnalyticsInsight["type"]) => {
    switch (type) {
      case "achievement": return "🏆";
      case "warning": return "⚠️";
      case "suggestion": return "💡";
      case "milestone": return "🎯";
      default: return "ℹ️";
    }
  };

  const getBorderColor = (priority: AnalyticsInsight["priority"]) => {
    switch (priority) {
      case "high": return "border-red-200";
      case "medium": return "border-yellow-200";
      case "low": return "border-blue-200";
      default: return "border-border";
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getBorderColor(insight.priority)}`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{getIconForType(insight.type)}</span>
        <div className="flex-1">
          <h4 className="font-semibold">{insight.title}</h4>
          <p className="text-muted-foreground text-sm mt-1">{insight.description}</p>
          {insight.actionable && insight.actionText && (
            <button className="mt-2 text-sm text-primary hover:underline">
              {insight.actionText}
            </button>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          insight.priority === "high" ? "bg-red-100 text-red-800" :
          insight.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
          "bg-blue-100 text-blue-800"
        }`}>
          {insight.priority}
        </span>
      </div>
    </div>
  );
}