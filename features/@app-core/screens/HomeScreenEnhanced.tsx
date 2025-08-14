import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  createQueryBridge,
  type HydratedRouteProps,
} from "@green-stack/navigation";
import { View, ScrollView, Text } from "../components/styled";
import { Header } from "../components/Header";
import { TaskChecklistEnhanced } from "../components/TaskChecklistEnhanced.web";
import { HeatmapView } from "../components/HeatmapView";
import { AIMotivation } from "../components/AIMotivation.web";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isMobile } from "@app/config";
import type { DayLog, TaskId } from "../../../packages/domain/src/types";
import { computeDayCompletion } from "../../../packages/domain/src/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../../apps/next/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../apps/next/components/ui/tabs";
import { Progress } from "../../../apps/next/components/ui/progress";
import { Badge } from "../../../apps/next/components/ui/badge";

/* --- Mock Data (temporary until proper data fetching is set up) --- */

const mockDayLog: DayLog = {
  id: "1",
  userId: "user1",
  date: new Date().toISOString().split("T")[0],
  dayNumber: 15,
  tasks: {
    workout1: false,
    workout2: false,
    diet: false,
    water: false,
    reading: false,
    photo: false,
  },
  photos: [],
  journalEntries: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Generate mock logs for the past 30 days
const generateMockLogs = (): DayLog[] => {
  const logs: DayLog[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Random completion for demonstration
    const tasks = {
      workout1: Math.random() > 0.3,
      workout2: Math.random() > 0.4,
      diet: Math.random() > 0.2,
      water: Math.random() > 0.3,
      reading: Math.random() > 0.5,
      photo: Math.random() > 0.6,
    };

    logs.push({
      id: `log-${i}`,
      userId: "user1",
      date: dateStr,
      dayNumber: 30 - i,
      tasks,
      photos: [],
      journalEntries: [],
      createdAt: date,
      updatedAt: date,
    });
  }

  return logs;
};

/* --- Data Fetching --------------------------------------------------------------------------- */

export const queryBridge = createQueryBridge({
  routeDataFetcher: async () => ({ success: true }),
  routeParamsToQueryKey: () => ["home-enhanced"],
  routeParamsToQueryInput: () => ({}),
  fetcherDataToProps: () => ({}),
});

/* --- Types ----------------------------------------------------------------------------------- */

type HomeScreenEnhancedProps = HydratedRouteProps<typeof queryBridge>;

/* --- Helper Functions ------------------------------------------------------------------------ */

const calculateWeekStats = (logs: DayLog[]) => {
  const lastWeekLogs = logs.slice(-7);
  const completions = lastWeekLogs.map((log) => computeDayCompletion(log));
  const average = Math.round(
    completions.reduce((a, b) => a + b, 0) / completions.length,
  );
  const bestDay = Math.max(...completions);

  return { average, bestDay };
};

const calculateMonthStats = (logs: DayLog[]) => {
  const completedDays = logs.filter(
    (log) => computeDayCompletion(log) === 100,
  ).length;

  // Calculate current streak
  let currentStreak = 0;
  for (let i = logs.length - 1; i >= 0; i--) {
    if (computeDayCompletion(logs[i]) === 100) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { completedDays, currentStreak };
};

/* --- <HomeScreenEnhanced/> ------------------------------------------------------------------- */

const HomeScreenEnhanced = (props: HomeScreenEnhancedProps) => {
  const insets = useSafeAreaInsets();
  const [dayLog, setDayLog] = useState<DayLog>(mockDayLog);
  const [logs, setLogs] = useState<DayLog[]>([]);

  useEffect(() => {
    // Initialize with mock data
    setLogs(generateMockLogs());
  }, []);

  const handleToggleTask = (taskId: TaskId) => {
    setDayLog((prev) => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: !prev.tasks[taskId],
      },
      updatedAt: new Date(),
    }));
  };

  const completionPct = computeDayCompletion(dayLog);
  const weekStats = calculateWeekStats(logs);
  const monthStats = calculateMonthStats(logs);

  return (
    <>
      <StatusBar style="light" />
      <View
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        style={{
          paddingTop: isMobile ? Math.max(insets.top, 20) : 0,
        }}
        data-testid="home-screen-container"
      >
        {/* Header */}
        <View data-testid="header">
          <Header
            day={dayLog.dayNumber}
            total={90}
            completionPct={completionPct}
          />
        </View>

        {/* Page Title */}
        <View className="bg-white px-4 py-3 shadow-sm dark:bg-gray-800">
          <Text className="text-center text-2xl font-bold text-gray-900 dark:text-white">
            90-Hard Challenge
          </Text>
        </View>

        {/* Main Content with Tabs */}
        <View className="flex-1 px-4 pt-4">
          <Tabs defaultValue="today" className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>

            {/* Today Tab */}
            <TabsContent value="today" className="flex-1">
              <ScrollView
                className="flex-1"
                contentContainerClassName="pb-6"
                showsVerticalScrollIndicator={false}
              >
                {/* Day Progress Card */}
                <Card className="mb-4" data-testid="card-day-progress">
                  <CardHeader>
                    <CardTitle>Day {dayLog.dayNumber} of 90</CardTitle>
                    <CardDescription>
                      {Math.round((dayLog.dayNumber / 90) * 100)}% through your
                      journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(dayLog.dayNumber / 90) * 100}
                      className="h-2"
                    />
                  </CardContent>
                </Card>

                {/* AI Motivation */}
                <View className="mb-4">
                  <AIMotivation dayLog={dayLog} />
                </View>

                {/* Task Checklist */}
                <View className="mb-4">
                  <TaskChecklistEnhanced
                    dayLog={dayLog}
                    onToggleTask={handleToggleTask}
                    loading={false}
                  />
                </View>
              </ScrollView>
            </TabsContent>

            {/* Week Tab */}
            <TabsContent value="week" className="flex-1">
              <ScrollView
                className="flex-1"
                contentContainerClassName="pb-6"
                showsVerticalScrollIndicator={false}
              >
                <Card className="mb-4" data-testid="card-week-stats">
                  <CardHeader>
                    <CardTitle>Week Progress</CardTitle>
                    <CardDescription>
                      Your performance over the last 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <View className="space-y-4">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-gray-600 dark:text-gray-400">
                          Average Completion
                        </Text>
                        <Badge variant="secondary" className="text-lg">
                          {weekStats.average}%
                        </Badge>
                      </View>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-gray-600 dark:text-gray-400">
                          Best Day
                        </Text>
                        <Badge variant="default" className="text-lg">
                          {weekStats.bestDay}%
                        </Badge>
                      </View>
                    </View>
                  </CardContent>
                </Card>

                {/* Week Heatmap */}
                <Card data-testid="card-week-heatmap">
                  <CardHeader>
                    <CardTitle>7-Day Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HeatmapView
                      logs={logs.slice(-7)}
                      onDateClick={(date) => {
                        console.log("Date clicked:", date);
                      }}
                    />
                  </CardContent>
                </Card>
              </ScrollView>
            </TabsContent>

            {/* Month Tab */}
            <TabsContent value="month" className="flex-1">
              <ScrollView
                className="flex-1"
                contentContainerClassName="pb-6"
                showsVerticalScrollIndicator={false}
              >
                <Card className="mb-4" data-testid="card-month-stats">
                  <CardHeader>
                    <CardTitle>Month Overview</CardTitle>
                    <CardDescription>
                      Your progress over the last 30 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <View className="space-y-4">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-gray-600 dark:text-gray-400">
                          Total Days Completed
                        </Text>
                        <Badge variant="secondary" className="text-lg">
                          {monthStats.completedDays}/30
                        </Badge>
                      </View>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-gray-600 dark:text-gray-400">
                          Current Streak
                        </Text>
                        <Badge variant="default" className="text-lg">
                          {monthStats.currentStreak} days
                        </Badge>
                      </View>
                    </View>
                  </CardContent>
                </Card>

                {/* Month Heatmap */}
                <Card data-testid="card-month-heatmap">
                  <CardHeader>
                    <CardTitle>30-Day Heatmap</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HeatmapView
                      logs={logs}
                      onDateClick={(date) => {
                        console.log("Date clicked:", date);
                      }}
                    />
                  </CardContent>
                </Card>
              </ScrollView>
            </TabsContent>
          </Tabs>
        </View>
      </View>
    </>
  );
};

/* --- Exports --------------------------------------------------------------------------------- */

export default HomeScreenEnhanced;
