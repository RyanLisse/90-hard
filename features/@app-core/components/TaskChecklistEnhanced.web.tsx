import React from "react";
import type { DayLog, TaskId } from "../../../packages/domain/src/types";
import { computeDayCompletion } from "../../../packages/domain/src/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../apps/next/components/ui/card";
import { Checkbox } from "../../../apps/next/components/ui/checkbox";
import { Progress } from "../../../apps/next/components/ui/progress";
import { Badge } from "../../../apps/next/components/ui/badge";

interface TaskChecklistProps {
  dayLog: DayLog | null;
  onToggleTask: (taskId: TaskId) => void;
  loading?: boolean;
}

const TASK_LABELS: Record<TaskId, string> = {
  workout1: "Workout 1",
  workout2: "Workout 2",
  diet: "Diet",
  water: "Water",
  reading: "Reading",
  photo: "Photo",
};

const TASK_DESCRIPTIONS: Record<TaskId, string> = {
  workout1: "45 min indoor/outdoor",
  workout2: "45 min different activity",
  diet: "Follow your diet plan",
  water: "1 gallon (3.8L)",
  reading: "10 pages non-fiction",
  photo: "Progress photo",
};

const TASK_EMOJIS: Record<TaskId, string> = {
  workout1: "💪",
  workout2: "🏃",
  diet: "🥗",
  water: "💧",
  reading: "📚",
  photo: "📸",
};

export function TaskChecklistEnhanced({
  dayLog,
  onToggleTask,
  loading = false,
}: TaskChecklistProps) {
  if (!dayLog) {
    return (
      <Card className="flex flex-1 items-center justify-center p-8">
        <p className="text-gray-500">Loading tasks...</p>
      </Card>
    );
  }

  const completionPercentage = computeDayCompletion(dayLog);
  const isComplete = completionPercentage === 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Today's Tasks</CardTitle>
          <Badge
            variant={isComplete ? "default" : "secondary"}
            className="text-lg px-3 py-1"
          >
            {completionPercentage}% Complete
          </Badge>
        </div>
        <CardDescription>
          Track your daily progress across all 6 tasks
        </CardDescription>

        <div className="mt-4">
          <Progress
            value={completionPercentage}
            className="h-3"
            aria-label={`Progress: ${completionPercentage}%`}
            data-value={completionPercentage}
          />
        </div>

        {isComplete && (
          <div className="mt-4 text-center">
            <Badge variant="default" className="text-base px-4 py-2">
              🎉 All tasks completed!
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {(Object.keys(TASK_LABELS) as TaskId[]).map((taskId) => {
          const isChecked = dayLog.tasks[taskId];

          return (
            <div
              key={taskId}
              className={`flex items-start space-x-3 rounded-lg p-4 transition-colors ${
                isChecked
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : "bg-gray-50 dark:bg-gray-800/50"
              } ${loading ? "opacity-50" : ""}`}
            >
              <Checkbox
                id={taskId}
                checked={isChecked}
                onCheckedChange={() => !loading && onToggleTask(taskId)}
                disabled={loading}
                className="mt-1"
                aria-label={TASK_LABELS[taskId]}
              />

              <label
                htmlFor={taskId}
                className={`flex-1 cursor-pointer select-none ${
                  loading ? "cursor-not-allowed" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{TASK_EMOJIS[taskId]}</span>
                  <div className="flex-1">
                    <p
                      className={`font-medium text-base ${
                        isChecked
                          ? "text-blue-900 dark:text-blue-100"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {TASK_LABELS[taskId]}
                    </p>
                    <p
                      className={`mt-0.5 text-sm ${
                        isChecked
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {TASK_DESCRIPTIONS[taskId]}
                    </p>
                  </div>
                </div>
              </label>

              {loading && (
                <div className="ml-auto">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-b-transparent" />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
