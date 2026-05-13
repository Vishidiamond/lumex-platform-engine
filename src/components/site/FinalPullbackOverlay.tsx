import { useEffect, useRef, useState } from "react";
import { scrollStore } from "@/lib/scroll-store";

/**
 * Sequenced typography reveal for Beat 10 — fixed overlay, scroll-progress driven.
 *
 * Reveal schedule:
 *   0.92 → "Four constellations. One sky."
 *   0.96 → horizontal proof strip
 *   0.99 → "Not to be broad — to be the best."
 *   1.00 → "Lumex — The Future." (largest type on the site)
 *
 * Each reveal: opacity 0→1 + translateY 12→0 over 900ms, ease-out-cubic.
 * Once scrollProgress reaches 1.0, the closer holds full opacity and the
 * other three lines fade to 0.5 to recede behind it.
 */

const REVEALS = {
  headline: 0.92,
  proof: 0.96,
  closer: 0.99,
  brand: 1.0,
} as const;

const FADE_MS = 900;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

interface RevealState {
  /** wall-clock when first crossed reveal threshold */
  startedAt: number | null;
}

export function FinalPullbackOverlay() {
  const [reduce, setReduce] = useState(false);
  const headlineRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);
  const closerRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  // per-element latch (forward-only)
  const states = useRef({
    headline: { startedAt: null } as RevealState,
    proof:    { startedAt: null } as RevealState,
    closer:   { startedAt: null } as RevealState,
    brand:    { startedAt: null } as RevealState,
  });

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
      const now = performance.now();
      const s = states.current;

      // Latch each element when its threshold is crossed.
      (Object.keys(REVEALS) as Array<keyof typeof REVEALS>).forEach((k) => {
        if (s[k].startedAt === null && p >= REVEALS[k]) s[k].startedAt = now;
      });

      const isHolding = p >= 1.0; // at the closer
      const dim = isHolding ? 0.5 : 1.0;

      const apply = (
        el: HTMLDivElement | null,
        st: RevealState,
        targetMul: number,
      ) => {
        if (!el) return;
        let o = 0;
        let y = 12;
        if (st.startedAt !== null) {
          const t = reduce ? 1 : Math.min(1, (now - st.startedAt) / FADE_MS);
          const eased = easeOutCubic(t);
          o = eased * targetMul;
          y = (1 - eased) * 12;
        }
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate(-50%, calc(-50% + ${y.toFixed(2)}px))`;
        el.style.visibility = o > 0.001 ? "visible" : "hidden";
      };

      apply(headlineRef.current, s.headline, dim);
      apply(proofRef.current,    s.proof,    dim);
      apply(closerRef.current,   s.closer,   dim);
      // brand line never dims — it IS the closer
      apply(brandRef.current,    s.brand,    1.0);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20">
      {/* "Four constellations. One sky." — top third */}
      <div
        ref={headlineRef}
        className="absolute left-1/2 px-6 text-center"
        style={{
          top: "20%",
          transform: "translate(-50%, -50%)",
          opacity: 0,
          visibility: "hidden",
          willChange: "opacity, transform",
          maxWidth: "min(900px, 88vw)",
        }}
      >
        <p
          className="text-balance text-2xl font-semibold leading-[1.05] tracking-tight text-white md:text-4xl"
          style={{ textShadow: "0 0 24px rgba(10,18,40,0.6)" }}
        >
          Four constellations. One sky.
        </p>
      </div>

      {/* Proof strip — upper-mid */}
      <div
        ref={proofRef}
        className="absolute left-1/2 w-[min(960px,92vw)] px-6"
        style={{
          top: "33%",
          transform: "translate(-50%, -50%)",
          opacity: 0,
          visibility: "hidden",
          willChange: "opacity, transform",
        }}
      >
        <ul
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-y border-white/15 py-4 text-[11px] text-white/75 md:text-xs"
          style={{ letterSpacing: "0.18em", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}
        >
          <li>30 patented diamond shapes</li>
          <li aria-hidden className="text-white/25">·</li>
          <li>1,000+ proprietary styles</li>
          <li aria-hidden className="text-white/25">·</li>
          <li>200+ active clients</li>
          <li aria-hidden className="text-white/25">·</li>
          <li>20+ geographies</li>
        </ul>
      </div>

      {/* "Not to be broad — to be the best." — lower-mid */}
      <div
        ref={closerRef}
        className="absolute left-1/2 px-6 text-center"
        style={{
          top: "47%",
          transform: "translate(-50%, -50%)",
          opacity: 0,
          visibility: "hidden",
          willChange: "opacity, transform",
          maxWidth: "min(900px, 88vw)",
        }}
      >
        <p
          className="text-balance text-base text-white/85 md:text-xl"
          style={{ letterSpacing: "0.02em" }}
        >
          Not to be broad — to be the best.
        </p>
      </div>

      {/* "Lumex — The Future." — center, largest type */}
      <div
        ref={brandRef}
        className="absolute left-1/2 px-6 text-center"
        style={{
          top: "66%",
          transform: "translate(-50%, -50%)",
          opacity: 0,
          visibility: "hidden",
          willChange: "opacity, transform",
          maxWidth: "min(1100px, 94vw)",
        }}
      >
        <p
          className="text-balance font-semibold leading-[0.95] tracking-tight text-white"
          style={{
            fontSize: "clamp(2.6rem, 9vw, 7.5rem)",
            textShadow: "0 0 36px rgba(10,18,40,0.65)",
          }}
        >
          Lumex — The Future.
        </p>
      </div>
    </div>
  );
}
