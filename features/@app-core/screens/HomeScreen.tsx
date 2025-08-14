import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  createQueryBridge,
  type HydratedRouteProps,
} from '@green-stack/navigation';
import { View, ScrollView, Text } from '../components/styled';
import { Header } from '../components/Header';
import { TaskChecklist } from '../components/TaskChecklist';
import { HeatmapView } from '../components/HeatmapView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isMobile } from '@app/config';
import type { DayLog, TaskId } from '../../../packages/domain/src/types';
import { computeDayCompletion } from '../../../packages/domain/src/types';

/* --- Mock Data (temporary until proper data fetching is set up) --- */

const mockDayLog: DayLog = {
  id: '1',
  userId: 'user1',
  date: new Date().toISOString().split('T')[0],
  dayNumber: 1,
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
    const dateStr = date.toISOString().split('T')[0];
    
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
      userId: 'user1',
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

// Simple query bridge for now (will be enhanced with real GraphQL queries later)
export const queryBridge = createQueryBridge({
  routeDataFetcher: async () => ({ success: true }),
  routeParamsToQueryKey: () => ['home'],
  routeParamsToQueryInput: () => ({}),
  fetcherDataToProps: () => ({}),
});

/* --- Types ----------------------------------------------------------------------------------- */

type HomeScreenProps = HydratedRouteProps<typeof queryBridge>;

/* --- <HomeScreen/> --------------------------------------------------------------------------- */

const HomeScreen = (props: HomeScreenProps) => {
  const insets = useSafeAreaInsets();
  const [dayLog, setDayLog] = useState<DayLog>(mockDayLog);
  const [logs, setLogs] = useState<DayLog[]>([]);
  
  useEffect(() => {
    // Initialize with mock data
    setLogs(generateMockLogs());
  }, []);
  
  const handleToggleTask = (taskId: TaskId) => {
    setDayLog(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskId]: !prev.tasks[taskId],
      },
      updatedAt: new Date(),
    }));
  };
  
  const completionPct = computeDayCompletion(dayLog);
  
  return (
    <>
      <StatusBar style="light" />
      <View 
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        style={{
          paddingTop: isMobile ? Math.max(insets.top, 20) : 0,
        }}
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
        
        {/* Main Content */}
        <ScrollView 
          className="flex-1"
          contentContainerClassName="pb-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Day Progress Indicator */}
          <View className="px-4 py-4" data-testid="day-progress">
            <View className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
              <Text className="text-center text-lg font-medium text-gray-600 dark:text-gray-300">
                Day {dayLog.dayNumber} of 90
              </Text>
              <View className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <View
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(dayLog.dayNumber / 90) * 100}%` }}
                />
              </View>
            </View>
          </View>
          
          {/* Task Checklist */}
          <View className="px-4 pb-4" data-testid="task-checklist">
            <TaskChecklist
              dayLog={dayLog}
              onToggleTask={handleToggleTask}
              loading={false}
            />
          </View>
          
          {/* Heatmap View */}
          <View className="px-4">
            <HeatmapView 
              logs={logs}
              onDateClick={(date) => {
                console.log('Date clicked:', date);
              }}
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
};

/* --- Exports --------------------------------------------------------------------------------- */

export default HomeScreen;