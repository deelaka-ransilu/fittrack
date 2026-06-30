"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { getLogs, deleteLog } from "@/lib/storage";
import { DailyLog } from "@/types";

const DAY_TYPE_COLOR: Record<string, string> = {
  Push: "var(--accent)",
  Pull: "var(--blue)",
  Shoulders: "var(--purple)",
  Legs: "var(--green)",
  "Core Only": "var(--muted)",
  Rest: "var(--muted)",
};

export default function HistoryPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLogs(getLogs().sort((a, b) => b.id.localeCompare(a.id)));
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.id.includes(search) ||
      l.gym.dayType.toLowerCase().includes(search.toLowerCase()) ||
      l.gym.notes.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Delete this log?")) {
      deleteLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const sleepColor = (h: number) =>
    h >= 7 ? "var(--green)" : h >= 5.5 ? "#eab308" : "var(--red)";

  return (
    <div style={{ padding: "20px 16px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>History</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by date, day type..."
        style={{ marginBottom: 16 }}
      />

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 36 }}>📭</p>
          <p style={{ fontSize: 16, fontWeight: 700, marginTop: 12 }}>No logs yet</p>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
            Start logging your daily sessions
          </p>
          <Link href="/log" className="btn btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
            Log Today
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((log) => (
            <div key={log.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{
                      background: DAY_TYPE_COLOR[log.gym.dayType],
                      color: "white", fontSize: 11, fontWeight: 700,
                      padding: "2px 8px", borderRadius: 99
                    }}>
                      {log.gym.dayType}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>
                      {new Date(log.id).toDateString()}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {log.sleep.totalHours > 0 && (
                      <span style={{ fontSize: 12, color: sleepColor(log.sleep.totalHours) }}>
                        😴 {log.sleep.totalHours}h
                      </span>
                    )}
                    {log.water > 0 && (
                      <span style={{ fontSize: 12, color: "var(--blue)" }}>💧 {log.water}L</span>
                    )}
                    {(log.cycling.toGym + log.cycling.fromGym) > 0 && (
                      <span style={{ fontSize: 12, color: "var(--accent)" }}>
                        🚴 {(log.cycling.toGym + log.cycling.fromGym).toFixed(1)}km
                      </span>
                    )}
                    {log.gym.energyLevel > 0 && (
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>
                        ⚡ {log.gym.energyLevel}/10
                      </span>
                    )}
                    {log.weight && (
                      <span style={{ fontSize: 12, color: "var(--green)" }}>
                        ⚖️ {log.weight}kg
                      </span>
                    )}
                  </div>

                  {/* Exercises */}
                  {log.gym.exercises.length > 0 && (
                    <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                      {log.gym.exercises.length} exercises logged
                      {log.gym.workoutFeel && ` · ${log.gym.workoutFeel}`}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
                  <Link
                    href={`/log?date=${log.id}`}
                    className="btn btn-ghost"
                    style={{ fontSize: 12, padding: "6px 10px" }}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="btn"
                    style={{ background: "transparent", color: "var(--red)", border: "1px solid var(--red)", fontSize: 12, padding: "6px 10px" }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {log.gym.notes && (
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                  📝 {log.gym.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
