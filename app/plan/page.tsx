"use client";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { WORKOUT_PLAN, SESSION_SEQUENCE } from "@/lib/workoutPlan";

const COLOR_MAP: Record<string, string> = {
  orange: "var(--accent)",
  blue: "var(--blue)",
  purple: "var(--purple)",
  green: "var(--green)",
  gray: "var(--muted)",
};

export default function PlanPage() {
  const [active, setActive] = useState<keyof typeof WORKOUT_PLAN>("Push");
  const plan = WORKOUT_PLAN[active];
  const color = COLOR_MAP[plan.color];

  return (
    <div style={{ padding: "20px 16px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Workout Plan</h1>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
        Your personalised 4-day push/pull/shoulders/legs split
      </p>

      {/* Sequence overview */}
      <div className="card" style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>SESSION ORDER</p>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
          Do these in order — any day that works for you. Skip a day, just pick up where you left off.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {SESSION_SEQUENCE.map((s, i) => (
            <div key={i} style={{
              flex: 1, textAlign: "center", padding: "10px 4px",
              borderRadius: 10, border: `2px solid ${COLOR_MAP[WORKOUT_PLAN[s].color]}`,
              background: "var(--surface2)",
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: COLOR_MAP[WORKOUT_PLAN[s].color] }}>
                {i + 1}
              </p>
              <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Day tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
        {(["Push", "Pull", "Shoulders", "Legs", "Core Only", "Rest"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className="btn"
            style={{
              background: active === k ? COLOR_MAP[WORKOUT_PLAN[k].color] : "var(--surface2)",
              color: active === k ? "white" : "var(--muted)",
              fontSize: 12, padding: "6px 14px", whiteSpace: "nowrap"
            }}
          >
            {k}
          </button>
        ))}
      </div>

      {/* Plan label */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color }}>{plan.label}</h2>
        <p style={{ fontSize: 12, color: "var(--muted)" }}>Target: 70–75 minutes max</p>
      </div>

      {plan.sections.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 48 }}>🛌</p>
          <p style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>Rest Day</p>
          <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 6 }}>
            This is when your muscles actually grow. Don't skip rest.
          </p>
        </div>
      ) : (
        plan.sections.map((section, si) => (
          <div key={si} style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
              — {section.name}
            </p>
            {section.exercises.map((ex, ei) => (
              <div key={ei} className="card" style={{ marginBottom: 8, borderLeft: `3px solid ${color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <p style={{ fontSize: 14, fontWeight: 700 }}>{ex.name}</p>
                  <span style={{
                    background: "var(--surface2)", borderRadius: 6, padding: "2px 8px",
                    fontSize: 12, fontWeight: 700, color, whiteSpace: "nowrap", marginLeft: 8
                  }}>
                    {ex.sets}×{ex.reps}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>💡 {ex.note}</p>
              </div>
            ))}
          </div>
        ))
      )}

      {/* Coach tips */}
      <div className="card" style={{ marginTop: 8, borderColor: "var(--accent)" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>⚠️ Coach Rules</p>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            "Warm-up: 5 min jump rope + 2 light sets before first exercise",
            "Rest 60–90s between sets (2 min for heavy compound)",
            "If last sets fail — reduce weight, don't drop reps",
            "Left arm always goes FIRST on unilateral exercises",
            "Core is always last — 10–15 min",
          ].map((tip, i) => (
            <li key={i} style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 8 }}>
              <span style={{ color: "var(--accent)" }}>›</span> {tip}
            </li>
          ))}
        </ul>
      </div>

      <BottomNav />
    </div>
  );
}
