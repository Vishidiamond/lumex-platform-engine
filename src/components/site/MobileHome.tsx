import { Link } from "@tanstack/react-router";
import { CONSTELLATIONS } from "@/galaxy/constellations";

export default function MobileHome() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#070b18",
        zIndex: 0,
        overflowY: "auto",
        padding: "96px 16px 48px",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {CONSTELLATIONS.map((c) => (
          <div
            key={c.id}
            style={{
              padding: 24,
              marginBottom: 16,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
            }}
          >
            <div
              style={{
                fontSize: 16,
                color: "#fff",
                letterSpacing: "0.02em",
                fontWeight: 500,
              }}
            >
              {c.name}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 14,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.5,
              }}
            >
              {c.tagline}
            </div>
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Link
                to={c.route}
                style={{
                  fontSize: 13,
                  color: "#66d0ff",
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                }}
              >
                Enter →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
