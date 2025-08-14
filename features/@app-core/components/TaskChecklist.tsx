import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import type { DayLog, TaskId } from '../../../packages/domain/src/types';
import { computeDayCompletion } from '../../../packages/domain/src/types';
import { CheckFilled } from '../icons';

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
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-gray-500">Loading tasks...</Text>
      </View>
    );
  }

  const completionPercentage = computeDayCompletion(dayLog);
  const isComplete = completionPercentage === 100;

  return (
    <View className="flex-1 bg-white p-4 dark:bg-gray-900">
      {/* Progress Header */}
      <View className="mb-6">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="font-bold text-2xl text-gray-900 dark:text-white">
            Today's Tasks
          </Text>
          <Text
            className={`font-semibold text-lg ${
              isComplete ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {completionPercentage}% Complete
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <View
            className={`h-full transition-all duration-300 ${
              isComplete ? 'bg-green-600' : 'bg-blue-600'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </View>

        {isComplete && (
          <Text className="mt-2 text-center font-semibold text-green-600">
            🎉 All tasks completed!
          </Text>
        )}
      </View>

      {/* Task List */}
      <View className="space-y-3">
        {(Object.keys(TASK_LABELS) as TaskId[]).map((taskId) => {
          const isChecked = dayLog.tasks[taskId];

          return (
            <TouchableOpacity
              accessibilityHint={`Toggle ${TASK_LABELS[taskId]} task`}
              accessibilityLabel={TASK_LABELS[taskId]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isChecked, disabled: loading }}
              className={`flex-row items-center rounded-xl p-4 ${
                isChecked
                  ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
              }border ${loading ? 'opacity-50' : ''} `}
              disabled={loading}
              key={taskId}
              onPress={() => !loading && onToggleTask(taskId)}
            >
              {/* Checkbox */}
              <View
                className={`mr-3 h-6 w-6 items-center justify-center rounded-md ${
                  isChecked
                    ? 'bg-blue-600'
                    : 'border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700'
                } `}
              >
                {isChecked && <CheckFilled className="h-4 w-4 text-white" />}
              </View>

              {/* Task Info */}
              <View className="flex-1">
                <Text
                  className={`font-medium text-base ${
                    isChecked
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-gray-900 dark:text-white'
                  } `}
                >
                  {TASK_LABELS[taskId]}
                </Text>
                <Text
                  className={`mt-0.5 text-sm ${
                    isChecked
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-500 dark:text-gray-400'
                  } `}
                >
                  {TASK_DESCRIPTIONS[taskId]}
                </Text>
              </View>

              {/* Loading indicator */}
              {loading && (
                <ActivityIndicator
                  color={isChecked ? '#2563eb' : '#6b7280'}
                  size="small"
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
