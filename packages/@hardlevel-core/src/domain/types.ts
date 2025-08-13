export type ISODate = `${number}-${number}-${number}`; // simple ISO YYYY-MM-DD

export const taskIds = [
  "workout1",
  "workout2",
  "diet",
  "water",
  "reading",
  "photo",
] as const;

export type TaskId = (typeof taskIds)[number];

export type Tasks = Record<TaskId, boolean>;

export interface DayLog {
  date: ISODate;
  tasks: Tasks;
  weightKg?: number;
  fastingH?: number;
}

export const emptyTasks = (): Tasks => ({
  workout1: false,
  workout2: false,
  diet: false,
  water: false,
  reading: false,
  photo: false,
});

