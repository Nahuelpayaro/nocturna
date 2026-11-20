import { ImageResponse } from "next/og";

// Social share card — generated at build time. The file-based convention wires
// it into both Open Graph and Twitter metadata automatically.
export const alt = "nocturna creative studio — Vemos lo que otros no ven.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#f5f5f3",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 14,
            color: "#82827b",
            textTransform: "uppercase",
          }}
        >
          estudio creativo
        </div>
        <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: -4, marginTop: 10 }}>
          nocturna
        </div>
        <div style={{ width: 120, height: 3, background: "#d9a441", margin: "30px 0" }} />
        <div style={{ fontSize: 38, color: "#cfcfca" }}>Vemos lo que otros no ven.</div>
        <div style={{ fontSize: 22, letterSpacing: 3, color: "#82827b", marginTop: 44 }}>
          Diseño web · Branding · Comunicación — Buenos Aires
        </div>
      </div>
    ),
    { ...size },
  );
}
