import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Pattern = "rails" | "sphere" | "lattice" | "house";

interface Star {
  x: number;
  y: number;
  r?: number;
  label?: string;
}

interface Edge {
  a: number;
  b: number;
}

interface Spec {
  stars: Star[];
  edges: Edge[];
  width: number;
  height: number;
}

// Each constellation is laid out on a 1000 x 600 viewBox.
const SPECS: Record<Pattern, Spec> = {
  // Long horizontal line of stars connecting points of light.
  rails: {
    width: 1000,
    height: 600,
    stars: [
      { x: 60, y: 320, r: 2 },
      { x: 160, y: 305 },
      { x: 250, y: 315 },
      { x: 340, y: 300 },
      { x: 430, y: 312, r: 3.2, label: "Lumex.online" },
      { x: 520, y: 305 },
      { x: 615, y: 318 },
      { x: 705, y: 308 },
      { x: 800, y: 320 },
      { x: 895, y: 312 },
      // soft drift stars
      { x: 200, y: 220 },
      { x: 380, y: 410 },
      { x: 600, y: 200 },
      { x: 760, y: 415 },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4 },
      { a: 4, b: 5 }, { a: 5, b: 6 }, { a: 6, b: 7 }, { a: 7, b: 8 }, { a: 8, b: 9 },
    ],
  },

  // Tight spherical cluster with geometric pattern.
  sphere: {
    width: 1000,
    height: 600,
    stars: (() => {
      const cx = 500;
      const cy = 300;
      const points: Star[] = [{ x: cx, y: cy, r: 3.4, label: "NSphere" }];
      const rings = [
        { r: 80, n: 6 },
        { r: 140, n: 10 },
        { r: 200, n: 14 },
      ];
      rings.forEach((ring, idx) => {
        for (let i = 0; i < ring.n; i++) {
          const a = (i / ring.n) * Math.PI * 2 + idx * 0.2;
          points.push({
            x: cx + Math.cos(a) * ring.r,
            y: cy + Math.sin(a) * ring.r * 0.78,
            r: idx === 0 ? 2.2 : idx === 1 ? 1.6 : 1.2,
          });
        }
      });
      return points;
    })(),
    edges: (() => {
      const edges: Edge[] = [];
      // ring 1 (indices 1..6)
      for (let i = 0; i < 6; i++) edges.push({ a: 1 + i, b: 1 + ((i + 1) % 6) });
      // ring 1 -> center
      for (let i = 0; i < 6; i++) edges.push({ a: 0, b: 1 + i });
      // ring 1 -> ring 2 spokes
      for (let i = 0; i < 6; i++) edges.push({ a: 1 + i, b: 7 + Math.floor((i / 6) * 10) });
      // ring 2 perimeter (indices 7..16)
      for (let i = 0; i < 10; i++) edges.push({ a: 7 + i, b: 7 + ((i + 1) % 10) });
      return edges;
    })(),
  },

  // Crystalline grid — unit cell.
  lattice: {
    width: 1000,
    height: 600,
    stars: (() => {
      const cols = 7;
      const rows = 4;
      const padX = 140;
      const padY = 110;
      const stepX = (1000 - padX * 2) / (cols - 1);
      const stepY = (600 - padY * 2) / (rows - 1);
      const pts: Star[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          pts.push({
            x: padX + c * stepX,
            y: padY + r * stepY,
            r: (r + c) % 3 === 0 ? 2.4 : 1.4,
          });
        }
      }
      return pts;
    })(),
    edges: (() => {
      const cols = 7;
      const rows = 4;
      const idx = (c: number, r: number) => r * cols + c;
      const edges: Edge[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (c < cols - 1) edges.push({ a: idx(c, r), b: idx(c + 1, r) });
          if (r < rows - 1) edges.push({ a: idx(c, r), b: idx(c, r + 1) });
          if (c < cols - 1 && r < rows - 1) edges.push({ a: idx(c, r), b: idx(c + 1, r + 1) });
        }
      }
      return edges;
    })(),
  },

  // Largest constellation — three sub-clusters + one faint star.
  house: {
    width: 1000,
    height: 600,
    stars: [
      // cluster A — Atelier Amara (left)
      { x: 200, y: 220, r: 3.2, label: "Atelier Amara" },
      { x: 130, y: 280 }, { x: 260, y: 310 }, { x: 175, y: 360 }, { x: 240, y: 180 },
      // cluster B — Fortunoff (center)
      { x: 510, y: 180, r: 3.2, label: "Fortunoff" },
      { x: 450, y: 250 }, { x: 560, y: 260 }, { x: 500, y: 330 }, { x: 590, y: 200 },
      // cluster C — next acquisition (right, faint)
      { x: 820, y: 300, r: 2.2, label: "More to come" },
      { x: 760, y: 360 }, { x: 880, y: 360 },
      // bridging stars
      { x: 360, y: 240 }, { x: 680, y: 240 },
    ],
    edges: [
      // A internal
      { a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 3 }, { a: 0, b: 4 },
      // B internal
      { a: 5, b: 6 }, { a: 5, b: 7 }, { a: 5, b: 8 }, { a: 5, b: 9 },
      // C internal
      { a: 10, b: 11 }, { a: 10, b: 12 },
      // Bridges
      { a: 0, b: 13 }, { a: 13, b: 5 }, { a: 5, b: 14 }, { a: 14, b: 10 },
    ],
  },
};

interface ConstellationProps {
  pattern: Pattern;
  className?: string;
  /** Whether the constellation should draw itself. */
  active?: boolean;
  /** When true, skip the entrance reveal — render fully drawn instantly. */
  instant?: boolean;
  /** Indices of stars that should pulse softly. */
  pulse?: number[];
  /** Hide labels (used for ambient overhead variants). */
  hideLabels?: boolean;
}

/**
 * SVG constellation. Stars fade in, then connecting lines draw with a
 * stroke-dashoffset reveal. Optionally renders fully drawn instantly
 * (for deep-dive overhead use) and pulses specific stars.
 */
export function Constellation({
  pattern,
  className,
  active = true,
  instant = false,
  pulse,
  hideLabels = false,
}: ConstellationProps) {
  const spec = SPECS[pattern];
  const isOn = instant ? true : active;
  const pulseSet = pulse ? new Set(pulse) : null;

  return (
    <svg
      viewBox={`0 0 ${spec.width} ${spec.height}`}
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      <g>
        {spec.edges.map((e, i) => {
          const a = spec.stars[e.a];
          const b = spec.stars[e.b];
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgba(180, 210, 255, 0.55)"
              strokeWidth={0.8}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={isOn ? 0 : 1}
              style={
                instant
                  ? { opacity: 0.7 }
                  : {
                      transition: `stroke-dashoffset 1.2s ease-out ${0.05 * i + 0.3}s, opacity 0.6s ease`,
                      opacity: isOn ? 1 : 0,
                    }
              }
            />
          );
        })}
        {spec.stars.map((s, i) => {
          const isPulsing = pulseSet?.has(i) ?? false;
          const baseR = s.r ?? 1.6;
          return (
            <g key={i}>
              {isPulsing ? (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={baseR}
                  fill="rgba(180, 210, 255, 0.35)"
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    animation: "lumex-star-pulse 2.4s ease-in-out infinite",
                  }}
                />
              ) : null}
              <circle
                cx={s.x}
                cy={s.y}
                r={baseR}
                fill="white"
                style={
                  instant
                    ? { opacity: isPulsing ? 1 : 0.85 }
                    : {
                        transition: `opacity 0.6s ease ${0.02 * i}s`,
                        opacity: isOn ? 1 : 0,
                      }
                }
              />
              {!hideLabels && s.label ? (
                <text
                  x={s.x + 14}
                  y={s.y - 10}
                  fill="rgba(220, 232, 255, 0.85)"
                  style={{
                    font: "500 13px 'JetBrains Mono', ui-monospace, monospace",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    transition: instant ? undefined : "opacity 0.8s ease 0.9s",
                    opacity: isOn ? 1 : 0,
                  }}
                >
                  {s.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** Hook: returns true once the element has scrolled into view. */
export function useInView<T extends Element>(threshold = 0.3) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}
