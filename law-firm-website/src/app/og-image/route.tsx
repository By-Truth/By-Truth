import { ImageResponse } from "next/og";
import { site } from "@/data/site";

/** Default 1200×630 social sharing image, generated at build time. */
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0b1628",
          color: "#ffffff",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 1, background: "#b89b5e" }} />
          <div style={{ fontSize: 24, letterSpacing: 6, color: "#b89b5e", textTransform: "uppercase" }}>
            Legal Counsel · Nigeria
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, lineHeight: 1.05 }}>{site.name}</div>
          <div style={{ fontSize: 40, marginTop: 28, color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>
            Trusted Legal Counsel. Strategic Representation.
          </div>
        </div>
        <div style={{ display: "flex", width: "100%", height: 2, background: "rgba(184,155,94,0.5)" }} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
