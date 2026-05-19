import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import logo from "@/assets/lumex-logo.png";

const SIZE = 160;
const RADIUS = 76;
const CIRC = 2 * Math.PI * RADIUS;
const MIN_DISPLAY_MS = 600;

export default function BrandedLoader() {
  const { progress, total } = useProgress();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const dismissedRef = useRef(false);
  const shownAt = useRef<number | null>(null);

  // Show the loader the first time any asset actually starts loading.
  useEffect(() => {
    if (dismissedRef.current) return;
    if (total > 0 && !mounted) {
      setMounted(true);
      setVisible(true);
      shownAt.current = performance.now();
    }
  }, [total, mounted]);

  // Dismiss when progress reaches 100, after a minimum display time.
  useEffect(() => {
    if (!mounted || dismissedRef.current) return;
    if (progress < 100) return;
    const elapsed = shownAt.current ? performance.now() - shownAt.current : 0;
    const wait = Math.max(0, MIN_DISPLAY_MS - elapsed);
    const t1 = setTimeout(() => setVisible(false), wait);
    const t2 = setTimeout(() => {
      dismissedRef.current = true;
      setMounted(false);
    }, wait + 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [progress, mounted]);

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
