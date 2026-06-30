"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/log", label: "Log", icon: "✏️" },
  { href: "/plan", label: "Plan", icon: "📋" },
  { href: "/history", label: "History", icon: "📅" },
  { href: "/progress", label: "Progress", icon: "📈" },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="bottom-nav">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={`nav-item ${path === n.href ? "active" : ""}`}
        >
          <span style={{ fontSize: 20 }}>{n.icon}</span>
          <span>{n.label}</span>
        </Link>
      ))}
    </nav>
  );
}
