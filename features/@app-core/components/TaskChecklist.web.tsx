import React from 'react';
import type { DayLog, TaskId } from '../../../packages/domain/src/types';
import { computeDayCompletion } from '../../../packages/domain/src/types';

// Simple check icon component
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      clipRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      fillRule="evenodd"
    />
  </svg>
);

interface TaskChecklistProps {
  dayLog: DayLog | null;
  onToggleTask: (taskId: TaskId) => void;
  loading?: boolean;
}

const TASK_LABELS: Record<TaskId, string> = {
  workout1: 'Workout 1',
  workout2: 'Workout 2',
  diet: 'Diet',
  water: 'Water',
  reading: 'Reading',
  photo: 'Photo',
};

const TASK_DESCRIPTIONS: Record<TaskId, string> = {
  workout1: '45 min indoor/outdoor',
  workout2: '45 min different activity',
  diet: 'Follow your diet plan',
  water: '1 gallon (3.8L)',
  reading: '10 pages non-fiction',
  photo: 'Progress photo',
};

export function TaskChecklist({
  dayLog,
  onToggleTask,
  loading = false,
}: TaskChecklistProps) {
  if (!dayLog) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-gray-500">Loading tasks...</p>
      </div>
    );
  }

  const completionPercentage = computeDayCompletion(dayLog);
  const isComplete = completionPercentage === 100;

  return (
    <div className="flex-1 bg-white p-4 dark:bg-gray-900">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-bold text-2xl text-gray-900 dark:text-white">
            Today's Tasks
          </h2>
          <span
            className={`font-semibold text-lg ${
              isComplete ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {completionPercentage}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full transition-all duration-300 ${
              isComplete ? 'bg-green-600' : 'bg-blue-600'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {isComplete && (
          <p className="mt-2 text-center font-semibold text-green-600">
            🎉 All tasks completed!
          </p>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {(Object.keys(TASK_LABELS) as TaskId[]).map((taskId) => {
          const isChecked = dayLog.tasks[taskId];

          return (
            <button
              aria-checked={isChecked}
              aria-disabled={loading}
              aria-label={TASK_LABELS[taskId]}
              className={`flex w-full items-center rounded-xl p-4 text-left transition-all duration-200 ${
                isChecked
                  ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
              }border ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md'} `}
              disabled={loading}
              key={taskId}
              onClick={() => !loading && onToggleTask(taskId)}
              onKeyDown={(e) => {
                if (!loading && (e.key === ' ' || e.code === 'Space')) {
                  e.preventDefault();
                  onToggleTask(taskId);
                }
              }}
              role="checkbox"
            >
              {/* Checkbox */}
              <div
                className={`mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ${
                  isChecked
                    ? 'bg-blue-600'
                    : 'border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700'
                } `}
              >
                {isChecked && <CheckIcon className="h-4 w-4 text-white" />}
              </div>

              {/* Task Info */}
              <div className="flex-1">
                <p
                  className={`font-medium text-base ${
                    isChecked
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-gray-900 dark:text-white'
                  } `}
                >
                  {TASK_LABELS[taskId]}
                </p>
                <p
                  className={`mt-0.5 text-sm ${
                    isChecked
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-500 dark:text-gray-400'
                  } `}
                >
                  {TASK_DESCRIPTIONS[taskId]}
                </p>
              </div>

              {/* Loading indicator */}
              {loading && (
                <div className="ml-3 h-5 w-5 animate-spin rounded-full border-gray-600 border-b-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
