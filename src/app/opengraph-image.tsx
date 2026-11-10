import { ImageResponse } from "next/og";

export const alt = "Dangal Gym — Mehdipatnam, Hyderabad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg,#09090b 0%,#111113 55%,#1c1c1f 100%)",
          color: "#F5F5F7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, letterSpacing: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 40, border: "3px solid #F5F5F7", display: "flex" }} />
          DANGAL GYM
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, lineHeight: 1, letterSpacing: -4, fontWeight: 300 }}>Train like a wrestler.</div>
          <div style={{ fontSize: 92, lineHeight: 1, letterSpacing: -4, fontWeight: 300, opacity: 0.7 }}>Live like a champion.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, opacity: 0.75 }}>
          <span>Aries Plaza, Mehdipatnam · Hyderabad</span>
          <span>+91 96764 43944</span>
        </div>
      </div>
    ),
    size,
  );
}
