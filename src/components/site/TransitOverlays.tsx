import { useEffect, useRef, useState } from "react";
import { scrollStore } from "@/lib/scroll-store";
import { KEYFRAMES, TRANSITS } from "./camera-config";

/**
 * Fixed overlay rendering each transit's typography. Reads scroll progress
 * directly so timing stays locked to the keyframed camera path.
 *
 * Per-transit asymmetric placement keeps each transit visually distinct.
 */
export function TransitOverlays() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = scrollStore.get();
      TRANSITS.forEach((t, i) => {
        const el = refs.current[i];
        if (!el) return;
        const a = KEYFRAMES[t.segIndex].progress;
        const b = KEYFRAMES[t.segIndex + 1].progress;
        const local = (p - a) / Math.max(1e-6, b - a);
        let alpha = 0;
        // Tightened window so transit copy clears well before the next
        // section's text/arrival type appears. Fade in 0.05–0.20,
        // hold 0.20–0.55, fade out 0.55–0.72; fully hidden by 0.72.
        if (local > 0.05 && local < 0.72) {
          if (local < 0.20) alpha = (local - 0.05) / 0.15;
          else if (local < 0.55) alpha = 1;
          else alpha = (0.72 - local) / 0.17;
          alpha = Math.max(0, Math.min(1, alpha)) * 0.85;
        }
        if (reduce) alpha = local > 0.05 && local < 0.72 ? 0.85 : 0;
        el.style.opacity = alpha.toFixed(3);
        el.style.visibility = alpha > 0.001 ? "visible" : "hidden";
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-20 hidden md:block"
    >
      {TRANSITS.map((t, i) => {
        const left = `calc(50% + ${t.lateralOffsetPct}vw)`;
        const top = `${t.verticalPct}%`;
        return (
          <div
            key={t.segIndex}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="absolute px-6"
            style={{
              left,
              top,
              transform: `translate(-50%, -50%)`,
              opacity: 0,
              visibility: "hidden",
              willChange: "opacity",
              transition: "opacity 90ms linear",
              maxWidth: "min(640px, 70vw)",
            }}
          >
            <p
              className="text-balance text-center text-xl font-light leading-snug text-white/90 md:text-3xl"
              style={{
                textShadow: "0 0 24px rgba(10,18,40,0.55), 0 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              {t.line}
            </p>
          </div>
        );
      })}
    </div>
  );
}
