"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import {
  getLogs,
  getThisWeekLogs,
  getStreakDays,
  getTodayId,
  exportData,
} from "@/lib/storage";
import { getNextSession, SESSION_SEQUENCE, WORKOUT_PLAN } from "@/lib/workoutPlan";
import { DailyLog } from "@/types";

export default function HomePage() {
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [weekLogs, setWeekLogs] = useState<DailyLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [allLogs, setAllLogs] = useState<DailyLog[]>([]);
  const [nextSession, setNextSession] = useState<keyof typeof WORKOUT_PLAN>("Push");
  const [recentSessions, setRecentSessions] = useState<DailyLog[]>([]);

  useEffect(() => {
    const logs = getLogs().sort((a, b) => a.id.localeCompare(b.id));
    const today = getTodayId();
    const todayEntry = logs.find((l) => l.id === today) ?? null;
    setTodayLog(todayEntry);
    setWeekLogs(getThisWeekLogs());
    setStreak(getStreakDays());
    setAllLogs(logs);

    const pastTypes = logs.map((l) => l.gym.dayType);
    // If today already logged as a gym session, next is after that
    const next = todayEntry && todayEntry.gym.dayType !== "Rest" && todayEntry.gym.dayType !== "Core Only"
      ? getNextSession([...pastTypes])
      : getNextSession(pastTypes.slice(0, -1)); // don't count today if it's rest
    setNextSession(todayEntry ? getNextSession(pastTypes) : getNextSession(pastTypes));

    // Last 6 gym logs for sequence display
    setRecentSessions(
      logs.filter((l) => l.gym.dayType !== "Rest" && l.gym.dayType !== "Core Only").slice(-6)
    );
  }, []);

  const weekCycling = weekLogs.reduce((s, l) => s + l.cycling.toGym + l.cycling.fromGym, 0);
  const weekGymDays = weekLogs.filter((l) => l.gym.dayType !== "Rest" && l.gym.dayType !== "Core Only").length;
  const avgSleep = weekLogs.filter(l => l.sleep.totalHours > 0).length
    ? (weekLogs.filter(l => l.sleep.totalHours > 0).reduce((s, l) => s + l.sleep.totalHours, 0) / weekLogs.filter(l => l.sleep.totalHours > 0).length).toFixed(1)
    : "—";
  const lastWeight = [...allLogs].reverse().find((l) => l.weight)?.weight;

  const sleepColor = (h: number) =>
    h >= 7 ? "var(--green)" : h >= 5.5 ? "#eab308" : "var(--red)";

  const SESSION_COLOR: Record<string, string> = {
    Push: "var(--accent)",
    Pull: "var(--blue)",
    Shoulders: "var(--purple)",
    Legs: "var(--green)",
    "Core Only": "var(--muted)",
    Rest: "var(--muted)",
  };

  const upcomingSequence = (() => {
    const pastTypes = allLogs.map((l) => l.gym.dayType);
    const gymSessions = pastTypes.filter(d => d !== "Rest" && d !== "Core Only");
    const lastIdx = gymSessions.length > 0
      ? SESSION_SEQUENCE.indexOf(gymSessions[gymSessions.length - 1] as typeof SESSION_SEQUENCE[number])
      : -1;
    return SESSION_SEQUENCE.map((s, i) => ({
      type: s,
      isNext: i === (lastIdx + 1) % SESSION_SEQUENCE.length,
    }));
  })();

  return (
    <div style={{ padding: "20px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>
            {new Date().toDateString()}
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>FitTrack 💪</h1>
        </div>
        <button className="btn btn-ghost" onClick={exportData} style={{ fontSize: 12 }}>
          ⬇️ Export
        </button>
      </div>

      {/* Next session card */}
      <div className="card" style={{ marginBottom: 16, borderColor: todayLog ? "var(--accent)" : "var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
              {todayLog ? "TODAY'S SESSION" : "NEXT SESSION"}
            </p>
            <p style={{ fontSize: 22, fontWeight: 800, color: SESSION_COLOR[todayLog?.gym.dayType ?? nextSession] }}>
              {todayLog ? todayLog.gym.dayType : nextSession}
            </p>
            {todayLog ? (
              <p style={{ fontSize: 13, color: "var(--green)", marginTop: 4 }}>✅ Logged today</p>
            ) : (
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Go when you're ready 🔥</p>
            )}
          </div>
          <Link href="/log" className="btn btn-primary" style={{ fontSize: 13 }}>
            {todayLog ? "Edit Log" : "Log Today"}
          </Link>
        </div>

        {todayLog && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
            <div className="stat-pill">
              <p style={{ fontSize: 11, color: "var(--muted)" }}>Sleep</p>
              <p style={{ fontWeight: 700, color: sleepColor(todayLog.sleep.totalHours) }}>
                {todayLog.sleep.totalHours}h
              </p>
            </div>
            <div className="stat-pill">
              <p style={{ fontSize: 11, color: "var(--muted)" }}>Water</p>
              <p style={{ fontWeight: 700 }}>{todayLog.water}L</p>
            </div>
            <div className="stat-pill">
              <p style={{ fontSize: 11, color: "var(--muted)" }}>Energy</p>
              <p style={{ fontWeight: 700 }}>{todayLog.gym.energyLevel}/10</p>
            </div>
          </div>
        )}
      </div>

      {/* Streak + Weight */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 32, marginBottom: 4 }}>🔥</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)" }}>{streak}</p>
          <p style={{ fontSize: 12, color: "var(--muted)" }}>Day Streak</p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 32, marginBottom: 4 }}>⚖️</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "var(--blue)" }}>
            {lastWeight ?? "—"}
          </p>
          <p style={{ fontSize: 12, color: "var(--muted)" }}>Last Weight (kg)</p>
        </div>
      </div>

      {/* This week stats */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 12 }}>THIS WEEK</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
          <div className="stat-pill">
            <p style={{ fontSize: 10, color: "var(--muted)" }}>Gym Days</p>
            <p style={{ fontWeight: 700, color: "var(--accent)" }}>{weekGymDays}/4</p>
          </div>
          <div className="stat-pill">
            <p style={{ fontSize: 10, color: "var(--muted)" }}>Cycling</p>
            <p style={{ fontWeight: 700, color: "var(--blue)" }}>{weekCycling.toFixed(1)}km</p>
          </div>
          <div className="stat-pill">
            <p style={{ fontSize: 10, color: "var(--muted)" }}>Avg Sleep</p>
            <p style={{ fontWeight: 700, color: Number(avgSleep) >= 7 ? "var(--green)" : "var(--red)" }}>
              {avgSleep}h
            </p>
          </div>
          <div className="stat-pill">
            <p style={{ fontSize: 10, color: "var(--muted)" }}>Logs</p>
            <p style={{ fontWeight: 700 }}>{weekLogs.length}</p>
          </div>
        </div>
      </div>

      {/* Session sequence — not calendar-based */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 12 }}>YOUR SEQUENCE</p>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
          Go in order — skip any day, just continue the sequence when you're back
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {upcomingSequence.map((s, i) => (
            <div key={i} style={{
              flex: 1, textAlign: "center", padding: "10px 4px",
              borderRadius: 10, border: `2px solid ${s.isNext ? SESSION_COLOR[s.type] : "var(--border)"}`,
              background: s.isNext ? "var(--surface2)" : "transparent",
            }}>
              <p style={{ fontSize: 10, color: s.isNext ? SESSION_COLOR[s.type] : "var(--muted)", fontWeight: s.isNext ? 700 : 400 }}>
                {s.type.slice(0, 4)}
              </p>
              {s.isNext && <p style={{ fontSize: 9, color: SESSION_COLOR[s.type], marginTop: 2 }}>NEXT</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div className="card">
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 10 }}>RECENT SESSIONS</p>
          {recentSessions.slice(-4).reverse().map((l, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "6px 0", borderBottom: "1px solid var(--border)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: SESSION_COLOR[l.gym.dayType], display: "inline-block"
                }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{l.gym.dayType}</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 12, color: sleepColor(l.sleep.totalHours) }}>
                  😴 {l.sleep.totalHours}h
                </span>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {new Date(l.id).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
