import React, { useEffect } from 'react';
import { useCompletion } from 'ai/react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../apps/next/components/ui/card';
import type { DayLog } from '../../../packages/domain/src/types';
import { computeDayCompletion } from '../../../packages/domain/src/types';

interface AIMotivationProps {
  dayLog: DayLog;
}

export function AIMotivation({ dayLog }: AIMotivationProps) {
  const completionPercentage = computeDayCompletion(dayLog);
  const { completion, complete, isLoading, error } = useCompletion({
    api: '/api/ai/motivation',
  });

  useEffect(() => {
    // Generate motivation based on current progress
    const prompt = `Generate a brief, encouraging motivation message for someone on Day ${dayLog.dayNumber} of 90 in their fitness challenge. They are ${completionPercentage}% complete with today's tasks. Keep it positive, specific, and under 2 sentences.`;
    
    complete(prompt);
  }, [dayLog.dayNumber, completionPercentage, complete]);

  const getMotivationIcon = () => {
    if (completionPercentage >= 80) return '🔥';
    if (completionPercentage >= 50) return '⭐';
    return '💪';
  };

  const defaultMessage = "Stay focused and keep pushing forward! Every task completed brings you closer to your goal.";

  return (
    <Card className="w-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{getMotivationIcon()}</span>
          Daily Motivation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-gray-500 animate-pulse">Generating motivation...</p>
        ) : (
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
            {error ? defaultMessage : completion || defaultMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
}