import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import logo from "@/assets/lumex-logo.png";

const SIZE = 160;
const RADIUS = 76;
const CIRC = 2 * Math.PI * RADIUS;

export default function BrandedLoader() {
  const { progress } = useProgress();
  const [mounted, setMounted] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (progress >= 100) {
      const t1 = setTimeout(() => setVisible(false), 50);
      const t2 = setTimeout(() => setMounted(false), 400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [progress]);

  if (!mounted) return null;

  const pct = Math.min(100, Math.max(0, progress));
  const dash = (pct / 100) * CIRC;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#070b18",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        opacity: visible ? 1 : 0,
        transition: "opacity 300ms ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div style={{ position: "relative", width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1.5}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#66d0ff"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRC}`}
            style={{ transition: "stroke-dasharray 200ms ease" }}
          />
        </svg>
        <img
          src={logo}
          alt="Lumex"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 120,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
      <div
        style={{
          fontFamily:
            "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.05em",
        }}
      >
        {Math.floor(pct)}%
      </div>
    </div>
  );
}
