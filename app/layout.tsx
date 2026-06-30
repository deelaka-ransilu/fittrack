import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitTrack — Deelaka",
  description: "Personal fitness tracker",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
