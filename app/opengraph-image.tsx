import { ImageResponse } from "next/og";

export const alt = "Soumik Belel — Data Analyst & Product Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background: "#0B0D10",
          backgroundImage:
            "linear-gradient(to right, rgba(232,234,237,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(232,234,237,0.06) 1px, transparent 1px), radial-gradient(ellipse at 20% 20%, rgba(196,163,90,0.18), transparent 50%)",
          backgroundSize: "64px 64px, 64px 64px, 100% 100%",
          color: "#E8EAED",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#C4A35A",
            marginBottom: 24,
          }}
        >
          Portfolio
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
          }}
        >
          Soumik Belel
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            color: "#8B909A",
            maxWidth: 720,
          }}
        >
          Data, markets, and products that ship.
        </div>
      </div>
    ),
    { ...size },
  );
}
