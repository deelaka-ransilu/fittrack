"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { getLogs, saveLog, calcSleepHours, getTodayId } from "@/lib/storage";
import { WORKOUT_PLAN, getNextSession } from "@/lib/workoutPlan";
import { DailyLog, DayType, Exercise, WorkoutFeel } from "@/types";

const defaultLog = (date: string, suggestedType: DayType = "Push"): DailyLog => {
  const plan = WORKOUT_PLAN[suggestedType];

  const exercises: Exercise[] = plan.sections.flatMap((s) =>
    s.exercises.map((e) => ({
      name: e.name,
      sets: Array.from({ length: e.sets }, () => ({
        weight: 0,
        reps: e.reps,
        completed: false,
      })),
    }))
  );

  return {
    id: date,
    date,
    sleep: { bedtime: "", wakeTime: "", totalHours: 0 },
    water: 0,
    cycling: { toGym: 0, fromGym: 0 },
    meals: { morning: "", lunch: "", evening: "", dinner: "" },
    gym: {
      dayType: suggestedType,
      exercises,
      energyLevel: 7,
      workoutFeel: "moderate",
      pain: "",
      notes: "",
    },
  };
};

export default function LogPage() {
  const router = useRouter();
  const [date, setDate] = useState(getTodayId());
  const [log, setLog] = useState<DailyLog>(defaultLog(getTodayId()));
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<"basics" | "food" | "gym" | "notes">("basics");

  useEffect(() => {
    const existing = getLogs().find((l) => l.id === date);
    if (existing) {
      setLog(existing);
    } else {
      // Figure out next session from past logs
      const allLogs = getLogs().sort((a, b) => a.id.localeCompare(b.id));
      const pastTypes = allLogs.map((l) => l.gym.dayType);
      const next = getNextSession(pastTypes);
      setLog(defaultLog(date, next));
    }
  }, [date]);

  const update = (path: string[], value: unknown) => {
    setLog((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as DailyLog;
      let obj: Record<string, unknown> = next as unknown as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]] as Record<string, unknown>;
      obj[path[path.length - 1]] = value;
      // recalc sleep
      if (path.includes("bedtime") || path.includes("wakeTime")) {
        next.sleep.totalHours = calcSleepHours(next.sleep.bedtime, next.sleep.wakeTime);
      }
      return next;
    });
  };

  const updateSet = (exIdx: number, setIdx: number, field: string, value: unknown) => {
    setLog((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as DailyLog;
      const s = next.gym.exercises[exIdx].sets[setIdx] as unknown as Record<string, unknown>;
      s[field] = value;
      return next;
    });
  };

  const handleSave = () => {
    saveLog(log);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sleepColor = log.sleep.totalHours >= 7 ? "var(--green)" : log.sleep.totalHours >= 5.5 ? "#eab308" : "var(--red)";
  const plan = WORKOUT_PLAN[log.gym.dayType];

  const sections = ["basics", "food", "gym", "notes"] as const;

  return (
    <div style={{ padding: "20px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Daily Log</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: "auto", fontSize: 13, padding: "6px 10px" }}
        />
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className="btn"
            style={{
              background: activeSection === s ? "var(--accent)" : "var(--surface2)",
              color: activeSection === s ? "white" : "var(--muted)",
              fontSize: 12, padding: "6px 14px", whiteSpace: "nowrap"
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* BASICS */}
      {activeSection === "basics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="card">
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 10 }}>😴 SLEEP</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)" }}>Bed time</label>
                <input type="time" value={log.sleep.bedtime} onChange={(e) => update(["sleep", "bedtime"], e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)" }}>Wake time</label>
                <input type="time" value={log.sleep.wakeTime} onChange={(e) => update(["sleep", "wakeTime"], e.target.value)} />
              </div>
            </div>
            {log.sleep.totalHours > 0 && (
              <div style={{ marginTop: 10, textAlign: "center" }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: sleepColor }}>
                  {log.sleep.totalHours}h
                </span>
                <span style={{ fontSize: 13, color: "var(--muted)", marginLeft: 8 }}>
                  {log.sleep.totalHours >= 7 ? "✅ Great" : log.sleep.totalHours >= 5.5 ? "⚠️ Ok" : "🔴 Too low"}
                </span>
              </div>
            )}
          </div>

          <div className="card">
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 10 }}>💧 WATER (liters)</p>
            <input
              type="number" step="0.5" min="0" max="6"
              value={log.water || ""}
              onChange={(e) => update(["water"], parseFloat(e.target.value) || 0)}
              placeholder="e.g. 3"
            />
          </div>

          <div className="card">
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 10 }}>🚴 CYCLING (km)</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)" }}>Home → Gym</label>
                <input type="number" step="0.1" value={log.cycling.toGym || ""} onChange={(e) => update(["cycling", "toGym"], parseFloat(e.target.value) || 0)} placeholder="9.7" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--muted)" }}>Gym → Home</label>
                <input type="number" step="0.1" value={log.cycling.fromGym || ""} onChange={(e) => update(["cycling", "fromGym"], parseFloat(e.target.value) || 0)} placeholder="5.9" />
              </div>
            </div>
            {(log.cycling.toGym + log.cycling.fromGym) > 0 && (
              <p style={{ fontSize: 13, color: "var(--blue)", marginTop: 8, textAlign: "center" }}>
                Total: {(log.cycling.toGym + log.cycling.fromGym).toFixed(1)} km
              </p>
            )}
          </div>

          <div className="card">
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 10 }}>⚖️ WEIGHT (optional)</p>
            <input
              type="number" step="0.1"
              value={log.weight || ""}
              onChange={(e) => update(["weight"], parseFloat(e.target.value) || undefined)}
              placeholder="74.8"
            />
          </div>
        </div>
      )}

      {/* FOOD */}
      {activeSection === "food" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(["morning", "lunch", "evening", "dinner"] as const).map((meal) => (
            <div key={meal} className="card">
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 8, display: "block" }}>
                🍽️ {meal.charAt(0).toUpperCase() + meal.slice(1)}
              </label>
              <textarea
                rows={2}
                value={log.meals[meal]}
                onChange={(e) => update(["meals", meal], e.target.value)}
                placeholder={meal === "morning" ? "e.g. 3 eggs + rice + dhal" : "What did you eat?"}
                style={{ resize: "none" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* GYM */}
      {activeSection === "gym" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="card">
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 10 }}>🏋️ SESSION TYPE</p>
            <select
              value={log.gym.dayType}
              onChange={(e) => update(["gym", "dayType"], e.target.value as DayType)}
            >
              {Object.keys(WORKOUT_PLAN).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {log.gym.dayType !== "Rest" && (
            <>
              {/* Exercises */}
              {log.gym.exercises.map((ex, exIdx) => (
                <div key={exIdx} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <p style={{ fontSize: 14, fontWeight: 700 }}>{ex.name}</p>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>
                      {plan.sections.flatMap(s => s.exercises).find(e => e.name === ex.name)?.note ?? ""}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 1fr 50px", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>#</span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>kg</span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>reps</span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>done</span>
                  </div>
                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx} style={{ display: "grid", gridTemplateColumns: "30px 1fr 1fr 50px", gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "var(--muted)", paddingTop: 8 }}>{setIdx + 1}</span>
                      <input type="number" step="0.5" value={set.weight || ""} onChange={(e) => updateSet(exIdx, setIdx, "weight", parseFloat(e.target.value) || 0)} placeholder="0" style={{ padding: "6px 8px", fontSize: 13 }} />
                      <input type="number" value={set.reps || ""} onChange={(e) => updateSet(exIdx, setIdx, "reps", parseInt(e.target.value) || 0)} placeholder="10" style={{ padding: "6px 8px", fontSize: 13 }} />
                      <button
                        onClick={() => updateSet(exIdx, setIdx, "completed", !set.completed)}
                        style={{
                          background: set.completed ? "var(--green)" : "var(--surface2)",
                          border: "1px solid var(--border)", borderRadius: 8,
                          color: "white", cursor: "pointer", fontSize: 16
                        }}
                      >
                        {set.completed ? "✓" : "○"}
                      </button>
                    </div>
                  ))}
                </div>
              ))}

              {/* Energy + feel */}
              <div className="card">
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 10 }}>
                  ⚡ ENERGY LEVEL — <span style={{ color: "var(--accent)" }}>{log.gym.energyLevel}/10</span>
                </p>
                <input
                  type="range" min="1" max="10"
                  value={log.gym.energyLevel}
                  onChange={(e) => update(["gym", "energyLevel"], parseInt(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="card">
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 10 }}>💪 HOW DID IT FEEL?</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(["easy", "moderate", "hard", "destroyed"] as WorkoutFeel[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => update(["gym", "workoutFeel"], f)}
                      className="btn"
                      style={{
                        background: log.gym.workoutFeel === f ? "var(--accent)" : "var(--surface2)",
                        color: log.gym.workoutFeel === f ? "white" : "var(--muted)",
                        fontSize: 13, justifyContent: "center"
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card">
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 8, display: "block" }}>
                  😓 Pain / Discomfort
                </label>
                <input
                  value={log.gym.pain}
                  onChange={(e) => update(["gym", "pain"], e.target.value)}
                  placeholder="None, or describe..."
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* NOTES */}
      {activeSection === "notes" && (
        <div className="card">
          <label style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 8, display: "block" }}>
            📝 Notes
          </label>
          <textarea
            rows={8}
            value={log.gym.notes}
            onChange={(e) => update(["gym", "notes"], e.target.value)}
            placeholder="Mood, stress, anything else on your mind..."
            style={{ resize: "none" }}
          />
        </div>
      )}

      {/* Save button */}
      <div style={{ marginTop: 20 }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          style={{ width: "100%", justifyContent: "center", fontSize: 16, padding: "14px" }}
        >
          {saved ? "✅ Saved!" : "💾 Save Log"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
