import React from 'react';
import { HeatmapView } from '../components/HeatmapView';
import { TaskChecklist } from '../components/TaskChecklist.web';
import { useTrackingRange, useTrackingSync } from '../hooks/useTrackingSync';
import { getDateRange } from '../utils/heatmap';

interface TrackingScreenProps {
  userId: string;
}

export function TrackingScreen({ userId }: TrackingScreenProps) {
  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Get date range for heatmap (77 days)
  const dateRange = getDateRange();
  const startDate = dateRange[0].toISOString().split('T')[0];
  const endDate = dateRange[dateRange.length - 1].toISOString().split('T')[0];

  // Hooks for data fetching
  const {
    dayLog,
    isLoading: isDayLoading,
    error: dayError,
    toggleTask,
  } = useTrackingSync({ userId, date: today });

  const {
    logs,
    isLoading: isRangeLoading,
    error: rangeError,
  } = useTrackingRange({ userId, startDate, endDate });

  // Handle date click from heatmap
  const handleDateClick = (date: string) => {
    console.log('Date clicked:', date);
    // In a real app, this could navigate to a specific day view
  };

  if (dayError || rangeError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <h2 className="font-semibold text-red-800 dark:text-red-200">
              Error loading data
            </h2>
            <p className="mt-1 text-red-700 dark:text-red-300">
              {dayError?.message || rangeError?.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="py-6 text-center">
          <h1 className="font-bold text-3xl text-gray-900 dark:text-white">
            75 Hard Tracker
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your daily progress and build lasting habits
          </p>
        </div>

        {/* Today's Tasks */}
        <div className="rounded-lg bg-white shadow-sm dark:bg-gray-900">
          <TaskChecklist
            dayLog={dayLog}
            loading={isDayLoading}
            onToggleTask={toggleTask}
          />
        </div>

        {/* Progress Heatmap */}
        <div>
          {isRangeLoading ? (
            <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-900">
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-blue-600 border-b-2" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Loading progress data...
                </span>
              </div>
            </div>
          ) : (
            <HeatmapView logs={logs} onDateClick={handleDateClick} />
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
            <h3 className="font-medium text-gray-500 text-sm dark:text-gray-400">
              Current Streak
            </h3>
            <p className="mt-1 font-bold text-2xl text-gray-900 dark:text-white">
              {/* Calculate from logs */}0 days
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
            <h3 className="font-medium text-gray-500 text-sm dark:text-gray-400">
              Total Completed
            </h3>
            <p className="mt-1 font-bold text-2xl text-gray-900 dark:text-white">
              {
                logs.filter((log) => {
                  const tasks = Object.values(log.tasks);
                  return tasks.every((task) => task);
                }).length
              }{' '}
              days
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
            <h3 className="font-medium text-gray-500 text-sm dark:text-gray-400">
              Completion Rate
            </h3>
            <p className="mt-1 font-bold text-2xl text-gray-900 dark:text-white">
              {logs.length > 0
                ? Math.round(
                    (logs.filter((log) => {
                      const tasks = Object.values(log.tasks);
                      return tasks.every((task) => task);
                    }).length /
                      logs.length) *
                      100
                  )
                : 0}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
