import React from "react";
import { View, Text, cn } from "../styled";
import { TrendingUp, TrendingDown } from "lucide-react-native";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down";
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
  accentColor?: "blue" | "green" | "red" | "purple" | "orange";
  loading?: boolean;
  isPercentage?: boolean;
  valueFormatter?: (value: string | number) => string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  className,
  accentColor = "blue",
  loading = false,
  isPercentage = false,
  valueFormatter,
}) => {
  const accentColors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  const trendColors = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
  };

  if (loading) {
    return (
      <View
        testID="stats-card-skeleton"
        className={cn(
          "relative overflow-hidden rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800",
          className,
        )}
      >
        <View className="animate-pulse space-y-3">
          <View className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <View className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <View className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        </View>
      </View>
    );
  }

  const displayValue = valueFormatter
    ? valueFormatter(value)
    : isPercentage
      ? `${value}%`
      : value;

  return (
    <View
      testID="stats-card"
      className={cn(
        "relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-800",
        className,
      )}
    >
      {/* Accent Bar */}
      <View
        testID="accent-bar"
        className={cn(
          "absolute left-0 top-0 h-1 w-full",
          accentColors[accentColor],
        )}
      />

      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </Text>
        {icon && (
          <View className="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
            {icon}
          </View>
        )}
      </View>

      {/* Value */}
      <View className="mb-2">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white">
          {displayValue}
        </Text>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between">
        {subtitle && (
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </Text>
        )}

        {trend && trendValue && (
          <View className="flex-row items-center gap-1">
            {trend === "up" ? (
              <TrendingUp
                testID="trend-icon-up"
                size={16}
                className={trendColors.up}
              />
            ) : (
              <TrendingDown
                testID="trend-icon-down"
                size={16}
                className={trendColors.down}
              />
            )}
            <Text className={cn("text-sm font-medium", trendColors[trend])}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
