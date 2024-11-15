// types.ts


export type Priority = "High" | "Medium" | "Low";


export interface Task {
  id: string;
  category: string;
  completed: boolean;
  createdAt: string;
  deadline: string;
  priority: Priority;
  text: string;
  userId: string;
  totalWorkedTime: number;
}


export interface DateObject {
  dateString: string; // formatted as YYYY-MM-DD
  day: number;        // day of the month
  month: number;      // month as a number (1-12)
  timestamp: number;  // Unix timestamp in milliseconds
  year: number;       // full year
}


export type TaskCategoryMap = {
  [category: string]: Task[];
};

export interface HabitData {
    [date: string]: { selected: boolean; selectedColor: string };
  }
