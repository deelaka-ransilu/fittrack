import { DailyLog } from "@/types";

const KEY = "fittrack_logs";

export const getLogs = (): DailyLog[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getLogById = (id: string): DailyLog | null => {
  const logs = getLogs();
  return logs.find((l) => l.id === id) ?? null;
};

export const saveLog = (log: DailyLog): void => {
  const logs = getLogs();
  const index = logs.findIndex((l) => l.id === log.id);
  if (index >= 0) logs[index] = log;
  else logs.push(log);
  localStorage.setItem(KEY, JSON.stringify(logs));
};

export const deleteLog = (id: string): void => {
  const logs = getLogs().filter((l) => l.id !== id);
  localStorage.setItem(KEY, JSON.stringify(logs));
};

export const exportData = (): void => {
  const logs = getLogs();
  const blob = new Blob([JSON.stringify(logs, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fittrack-export-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = (jsonString: string): boolean => {
  try {
    const logs: DailyLog[] = JSON.parse(jsonString);
    localStorage.setItem(KEY, JSON.stringify(logs));
    return true;
  } catch {
    return false;
  }
};

export const getTodayId = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const calcSleepHours = (bedtime: string, wakeTime: string): number => {
  if (!bedtime || !wakeTime) return 0;
  const [bh, bm] = bedtime.split(":").map(Number);
  const [wh, wm] = wakeTime.split(":").map(Number);
  let mins = wh * 60 + wm - (bh * 60 + bm);
  if (mins < 0) mins += 24 * 60;
  return Math.round((mins / 60) * 10) / 10;
};

export const getStreakDays = (): number => {
  const logs = getLogs().sort((a, b) => b.id.localeCompare(a.id));
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (const log of logs) {
    const logDate = new Date(log.id);
    logDate.setHours(0, 0, 0, 0);
    const diff = (current.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 1 && log.gym.dayType !== "Rest") {
      streak++;
      current = logDate;
    } else if (diff > 1) break;
  }
  return streak;
};

export const getThisWeekLogs = (): DailyLog[] => {
  const logs = getLogs();
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  return logs.filter((l) => new Date(l.id) >= monday);
};
