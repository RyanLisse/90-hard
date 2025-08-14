import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { appConfig } from '../appConfig';

interface HeaderProps {
  day: number;
  total?: number;
  completionPct: number;
}

export function Header({ day, total = 75, completionPct }: HeaderProps) {
  // For SSR, start with a static time to avoid hydration mismatch
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Use a placeholder during SSR
  const displayTime = currentTime || new Date();

  // Format date: "Wednesday, March 27"
  const formattedDate = displayTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Format time: "14:32:15" or "--:--:--" during SSR
  const formattedTime = mounted
    ? displayTime.toTimeString().split(' ')[0]
    : '--:--:--';

  // Determine battery color based on completion percentage
  const getBatteryColor = (pct: number) => {
    if (pct < 33) return '#ef4444'; // red
    if (pct < 66) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  return (
    <View className="flex-col items-center justify-between bg-black px-4 py-3">
      {/* Date and Time Row */}
      <View className="mb-2 w-full flex-row items-center justify-between">
        <Text className="text-base text-white">{formattedDate}</Text>
        <Text
          className="text-base"
          style={{
            fontFamily: 'SF Mono, monospace',
            color: '#ff9500', // orange
          }}
        >
          {formattedTime}
        </Text>
      </View>

      {/* Day Streak and Battery Row */}
      <View className="w-full flex-row items-center justify-between">
        <Text className="font-medium text-gray-300 text-sm">
          Day {day}/{total}
        </Text>

        {/* Battery Progress Bar */}
        <View className="relative h-6 w-32 overflow-hidden rounded-sm border border-gray-600 bg-gray-800">
          <View
            className="h-full transition-all duration-300"
            style={{
              width: `${completionPct}%`,
              backgroundColor: getBatteryColor(completionPct),
            }}
            testID="battery-progress"
          />
          {/* Battery Terminal */}
          <View className="absolute top-[7px] right-[-2px] h-3 w-1 rounded-r-sm bg-gray-600" />
        </View>
      </View>
    </View>
  );
}
