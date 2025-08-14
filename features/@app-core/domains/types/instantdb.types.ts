import type { DayLog } from '../../../../packages/domain/src/types';
import type {
  FastingEntry,
  WeightEntry,
  WeightGoal,
} from '../weight/weight.types';

export interface InstantDBClient {
  query: (params: any) => Promise<{ data: any }>;
  createDayLog: (
    dayLog: Omit<DayLog, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<{ id: string }>;
  updateDayLog: (id: string, updates: Partial<DayLog>) => Promise<void>;
  createWeightEntry: (
    entry: Omit<WeightEntry, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<{ id: string }>;
  updateWeightEntry: (
    id: string,
    updates: Partial<WeightEntry>
  ) => Promise<void>;
  deleteWeightEntry: (id: string) => Promise<void>;
  createWeightGoal: (
    goal: Omit<WeightGoal, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<{ id: string }>;
  updateWeightGoal: (id: string, updates: Partial<WeightGoal>) => Promise<void>;
  createFastingEntry: (
    entry: Omit<FastingEntry, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<{ id: string }>;
  updateFastingEntry: (
    id: string,
    updates: Partial<FastingEntry>
  ) => Promise<void>;
  deleteFastingEntry: (id: string) => Promise<void>;
  transact: (operations: any[]) => Promise<void>;
}
