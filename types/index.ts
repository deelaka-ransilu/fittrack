export type DayType = "Push" | "Pull" | "Shoulders" | "Legs" | "Rest" | "Core Only";
export type WorkoutFeel = "easy" | "moderate" | "hard" | "destroyed";

export interface ExerciseSet {
  weight: number;
  reps: number;
  completed: boolean;
}

export interface Exercise {
  name: string;
  sets: ExerciseSet[];
}

export interface DailyLog {
  id: string; // "2026-06-21"
  date: string;
  sleep: {
    bedtime: string;   // "22:30"
    wakeTime: string;  // "05:15"
    totalHours: number;
  };
  water: number; // liters
  cycling: {
    toGym: number;
    fromGym: number;
  };
  weight?: number; // kg — log weekly
  meals: {
    morning: string;
    lunch: string;
    evening: string;
    dinner: string;
  };
  gym: {
    dayType: DayType;
    exercises: Exercise[];
    energyLevel: number; // 1-10
    workoutFeel: WorkoutFeel;
    pain: string;
    notes: string;
  };
}

export interface WeekSummary {
  weekStart: string;
  totalCyclingKm: number;
  totalGymDays: number;
  avgSleepHours: number;
  avgWater: number;
  avgEnergy: number;
}
