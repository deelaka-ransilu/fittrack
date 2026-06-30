"use client";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { getLogs, exportData } from "@/lib/storage";
import { DailyLog } from "@/types";

export default function ProgressPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [view, setView] = useState<"sleep" | "weight" | "cycling" | "energy">("sleep");

  useEffect(() => {
    setLogs(getLogs().sort((a, b) => a.id.localeCompare(b.id)));
  }, []);

  const last30 = logs.slice(-30);

  // Stats
  const totalCycling = logs.reduce((s, l) => s + l.cycling.toGym + l.cycling.fromGym, 0);
  const totalGymDays = logs.filter((l) => l.gym.dayType !== "Rest").length;
  const avgSleep = logs.length
    ? (logs.reduce((s, l) => s + l.sleep.totalHours, 0) / logs.filter(l => l.sleep.totalHours > 0).length).toFixed(1)
    : "—";
  const weights = logs.filter((l) => l.weight).map((l) => ({ date: l.id, w: l.weight! }));
  const weightChange = weights.length >= 2
    ? (weights[weights.length - 1].w - weights[0].w).toFixed(1)
    : null;

  // Simple bar chart data
  const chartData = last30.map((l) => {
    switch (view) {
      case "sleep": return { date: l.id.slice(5), val: l.sleep.totalHours, max: 10 };
      case "weight": return { date: l.id.slice(5), val: l.weight ?? 0, max: 100 };
      case "cycling": return { date: l.id.slice(5), val: l.cycling.toGym + l.cycling.fromGym, max: 20 };
      case "energy": return { date: l.id.slice(5), val: l.gym.energyLevel, max: 10 };
    }
  }).filter(d => d.val > 0);

  const chartMax = Math.max(...chartData.map(d => d.val), 1);

  const viewColor: Record<string, string> = {
    sleep: "var(--purple)", weight: "var(--blue)", cycling: "var(--accent)", energy: "var(--green)"
  };

  const targetLine: Record<string, number | null> = {
    sleep: 7, weight: null, cycling: null, energy: 8
  };

  return (
    <div style={{ padding: "20px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Progress</h1>
        <button className="btn btn-ghost" onClick={exportData} style={{ fontSize: 12 }}>
          ⬇️ Export JSON
        </button>
      </div>

      {/* Baseline */}
      <div className="card" style={{ marginBottom: 16, borderColor: "var(--accent)" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 10 }}>📌 BASELINE — JUNE 15, 2026</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "Start Weight", val: "74.8 kg" },
            { label: "Height", val: "5\'7\" / 170cm" },
            { label: "Est. Body Fat", val: "~22–25%" },
            { label: "Target Body Fat", val: "~12–15%" },
          ].map((s) => (
            <div key={s.label} className="stat-pill">
              <p style={{ fontSize: 11, color: "var(--muted)" }}>{s.label}</p>
              <p style={{ fontWeight: 700, fontSize: 14 }}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* All time stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)" }}>{totalGymDays}</p>
          <p style={{ fontSize: 12, color: "var(--muted)" }}>Total Gym Days</p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: "var(--blue)" }}>{totalCycling.toFixed(0)}km</p>
          <p style={{ fontSize: 12, color: "var(--muted)" }}>Total Cycling</p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: "var(--purple)" }}>{avgSleep}h</p>
          <p style={{ fontSize: 12, color: "var(--muted)" }}>Avg Sleep</p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: "var(--green)" }}>
            {weightChange !== null ? `${Number(weightChange) > 0 ? "+" : ""}${weightChange}kg` : "—"}
          </p>
          <p style={{ fontSize: 12, color: "var(--muted)" }}>Weight Change</p>
        </div>
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
          {(["sleep", "weight", "cycling", "energy"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="btn"
              style={{
                background: view === v ? viewColor[v] : "var(--surface2)",
                color: view === v ? "white" : "var(--muted)",
                fontSize: 12, padding: "5px 12px", whiteSpace: "nowrap"
              }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {chartData.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 20 }}>
            No data yet — start logging!
          </p>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120, overflowX: "auto", paddingBottom: 4 }}>
              {chartData.map((d, i) => {
                const height = Math.max((d.val / chartMax) * 110, 4);
                const target = targetLine[view];
                const isAboveTarget = target ? d.val >= target : true;
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 24 }}>
                    <div
                      style={{
                        width: 18, height, borderRadius: "3px 3px 0 0",
                        background: isAboveTarget ? viewColor[view] : "var(--red)",
                        transition: "height 0.3s"
                      }}
                    />
                    <span style={{ fontSize: 8, color: "var(--muted)", transform: "rotate(-45deg)", transformOrigin: "top left", marginTop: 2, whiteSpace: "nowrap" }}>
                      {d.date}
                    </span>
                  </div>
                );
              })}
            </div>
            {targetLine[view] && (
              <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
                🎯 Target: {targetLine[view]} — <span style={{ color: "var(--green)" }}>green</span> = above target, <span style={{ color: "var(--red)" }}>red</span> = below
              </p>
            )}
          </div>
        )}
      </div>

      {/* Weight log */}
      {weights.length > 0 && (
        <div className="card">
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 10 }}>⚖️ WEIGHT LOG</p>
          {weights.slice(-10).reverse().map((w, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "6px 0", borderBottom: "1px solid var(--border)"
            }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{new Date(w.date).toDateString()}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--blue)" }}>{w.w} kg</span>
            </div>
          ))}
        </div>
      )}

      {/* 3 month goals */}
      <div className="card" style={{ marginTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 10 }}>🎯 3-MONTH GOALS</p>
        {[
          { label: "June — Fix sleep (7h+), 100g+ protein daily", done: false },
          { label: "July — Visible waist reduction, increase weights", done: false },
          { label: "Aug/Sep — Ab outline starting, chest definition", done: false },
        ].map((g, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
            <span style={{ color: g.done ? "var(--green)" : "var(--border)", fontSize: 16, marginTop: 1 }}>
              {g.done ? "✅" : "○"}
            </span>
            <span style={{ fontSize: 13, color: g.done ? "var(--green)" : "var(--text)" }}>{g.label}</span>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
