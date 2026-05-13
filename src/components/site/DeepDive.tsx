import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Constellation } from "./Constellation";
import { Starfield } from "./Starfield";
import { cn } from "@/lib/utils";

export type Pattern = "rails" | "sphere" | "lattice" | "house";

export interface Division {
  id: Pattern;
  num: string; // "01"
  name: string; // "Rails"
  divisionLabel: string; // "Platform"
  to: "/platform" | "/technology" | "/diamonds" | "/house";
}

export const DIVISIONS: Division[] = [
  { id: "rails", num: "01", name: "Rails", divisionLabel: "Platform", to: "/platform" },
  { id: "sphere", num: "02", name: "Sphere", divisionLabel: "Technology", to: "/technology" },
  { id: "lattice", num: "03", name: "Lattice", divisionLabel: "Diamonds", to: "/diamonds" },
  { id: "house", num: "04", name: "House", divisionLabel: "Brands", to: "/house" },
];

/* ─────────── Per-page pulse context ─────────── */

interface PulseCtx {
  setActive: (stars: number[]) => void;
}
const PulseContext = createContext<PulseCtx | null>(null);

export function useBeatPulse(stars: number[]) {
  const ctx = useContext(PulseContext);
  const ref = useRef<HTMLDivElement | null>(null);
  // Stable serialized key so deps don't change every render
  const key = stars.join(",");

  useEffect(() => {
    const el = ref.current;
    if (!el || !ctx) return;
    const list = key ? key.split(",").map(Number) : [];
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
            ctx.setActive(list);
          }
        }
      },
      { threshold: [0.35, 0.6] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ctx, key]);

  return ref;
}

/** Imperative pulse handle. Call setPulse([...indices]) at any time
 *  (e.g. on hover) to override the active overhead pulse. */
export function usePulseControl() {
  const ctx = useContext(PulseContext);
  return ctx?.setActive ?? (() => {});
}

/* ─────────── Right-hand constellation rail ─────────── */

function ConstellationRail({
  current,
  transitTo,
  onTransit,
}: {
  current: Pattern;
  transitTo: Pattern | null;
  onTransit: (id: Pattern) => void;
}) {
  return (
    <nav
      aria-label="Constellation navigation"
      className="pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 md:block"
    >
      <ul className="pointer-events-auto flex flex-col items-end gap-5">
        {DIVISIONS.map((d) => {
          const isCurrent = d.id === current;
          const isTransit = transitTo === d.id;
          return (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => !isCurrent && onTransit(d.id)}
                className="group flex items-center gap-3"
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`${d.divisionLabel} — Constellation ${d.num} ${d.name}`}
              >
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 transition-opacity",
                    "opacity-0 group-hover:opacity-100",
                    (isCurrent || isTransit) && "opacity-100 text-white/70",
                  )}
                >
                  {d.divisionLabel}
                </span>
                <span
                  className={cn(
                    "block h-2.5 w-2.5 rounded-full border border-white/55 transition-all",
                    isCurrent ? "bg-white" : "bg-transparent group-hover:bg-white/30",
                    isTransit && "bg-white animate-pulse",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ─────────── Overhead constellation with parallax + pulse ─────────── */

function Overhead({ pattern, pulse }: { pattern: Pattern; pulse: number[] }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY * 0.08;
        const o = Math.max(0.25, 1 - window.scrollY / 1400);
        el.style.transform = `translate3d(0, ${-y}px, 0)`;
        el.style.opacity = String(o);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[55vh]"
    >
      <div
        ref={ref}
        className="mx-auto h-full max-w-6xl px-6 will-change-transform md:px-10"
      >
        <Constellation pattern={pattern} instant pulse={pulse} hideLabels />
      </div>
    </div>
  );
}

/* ─────────── Page shell ─────────── */

export function DeepDivePage({
  division,
  children,
}: {
  division: Pattern;
  children: ReactNode;
}) {
  const [pulse, setPulse] = useState<number[]>([]);
  const setActive = useCallback((stars: number[]) => setPulse(stars), []);
  const navigate = useNavigate();
  const [transitTo, setTransitTo] = useState<Pattern | null>(null);

  const onTransit = (id: Pattern) => {
    const target = DIVISIONS.find((d) => d.id === id);
    if (!target) return;
    setTransitTo(id);
    window.setTimeout(() => {
      navigate({ to: target.to });
    }, 420);
  };

  return (
    <PulseContext.Provider value={{ setActive }}>
      <div className="relative min-h-screen bg-[#070b18] text-[#e6ecf7]">
        <Starfield />
        <Overhead pattern={division} pulse={pulse} />
        <ConstellationRail current={division} transitTo={transitTo} onTransit={onTransit} />

        <div
          className={cn(
            "relative z-10 transition-opacity duration-300",
            transitTo ? "opacity-0" : "opacity-100",
          )}
        >
          {children}
        </div>

        <style>{`
          @keyframes lumex-star-pulse {
            0%, 100% { transform: scale(1); opacity: 0.0; }
            50%      { transform: scale(3.4); opacity: 0.55; }
          }
        `}</style>
      </div>
    </PulseContext.Provider>
  );
}

/* ─────────── Hero ─────────── */

export function DeepDiveHero({
  num,
  name,
  headline,
  subhead,
  ctaLabel,
  ctaHref,
  ctaExternal,
}: {
  num: string;
  name: string;
  headline: string;
  subhead: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaExternal?: boolean;
}) {
  return (
    <header className="relative px-6 pb-24 pt-[58vh] md:px-10">
      <div className="mx-auto max-w-6xl">
        <p
          className="text-xs uppercase text-white/55"
          style={{ letterSpacing: "0.32em", fontFamily: "var(--font-mono)" }}
        >
          Constellation {num} · {name}
        </p>
        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
          {headline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white/70">{subhead}</p>
        {ctaLabel && ctaHref ? (
          <div className="mt-10">
            <a
              href={ctaHref}
              target={ctaExternal ? "_blank" : undefined}
              rel={ctaExternal ? "noopener noreferrer" : undefined}
              className="ghost-cta-deep"
            >
              {ctaLabel}
              {ctaExternal ? <ArrowUpRight className="h-4 w-4" /> : null}
            </a>
          </div>
        ) : null}
      </div>
    </header>
  );
}

/* ─────────── Beat ─────────── */

export function Beat({
  eyebrow,
  headline,
  pulses,
  children,
  closer,
}: {
  eyebrow?: string;
  headline: string;
  pulses: number[];
  children: ReactNode;
  closer?: string;
}) {
  const ref = useBeatPulse(pulses);
  return (
    <section ref={ref} className="relative px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        {eyebrow ? (
          <p
            className="text-xs uppercase text-white/45"
            style={{ letterSpacing: "0.28em", fontFamily: "var(--font-mono)" }}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-4 max-w-4xl text-3xl font-semibold leading-[1.08] tracking-tight text-white md:text-5xl">
          {headline}
        </h2>
        <div className="mt-10">{children}</div>
        {closer ? (
          <p
            className="mt-16 text-sm uppercase text-white/55"
            style={{ letterSpacing: "0.28em", fontFamily: "var(--font-mono)" }}
          >
            {closer}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/* ─────────── Contrast block ─────────── */

export function Contrast({ not, then }: { not: string; then: string }) {
  return (
    <div className="my-6 border-y border-white/10 py-10">
      <p className="max-w-5xl text-2xl font-light leading-snug text-white/55 md:text-4xl">
        {not}
      </p>
      <p className="mt-3 max-w-5xl text-2xl font-semibold leading-snug text-white md:text-4xl">
        {then}
      </p>
    </div>
  );
}

/* ─────────── Numbered proof bar ─────────── */

export function ProofBar({
  items,
}: {
  items: { value: string; label: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-y border-white/15 py-10 md:grid-cols-4">
      {items.map((it) => (
        <div key={it.label}>
          <p
            className="text-4xl font-semibold tracking-tight text-white tabular-nums md:text-5xl"
            style={{ fontFeatureSettings: "'tnum'" }}
          >
            {it.value}
          </p>
          <p
            className="mt-3 text-[11px] uppercase text-white/55"
            style={{ letterSpacing: "0.24em", fontFamily: "var(--font-mono)" }}
          >
            {it.label}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─────────── Closer + CTA ─────────── */

export function PageCloser({ line }: { line: string }) {
  return (
    <section className="relative px-6 py-32 text-center md:px-10">
      <p
        className="mx-auto max-w-3xl text-xl uppercase text-white md:text-2xl"
        style={{ letterSpacing: "0.32em", fontFamily: "var(--font-mono)" }}
      >
        {line}
      </p>
    </section>
  );
}

export function ContinueJourney({
  to,
  label = "Continue the journey",
}: {
  to: Division["to"];
  label?: string;
}) {
  return (
    <section className="relative border-t border-white/10 px-6 py-20 md:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-end">
        <Link to={to} className="ghost-cta-deep">
          {label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <style>{`
        .ghost-cta-deep {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid rgba(255,255,255,0.25);
          padding: 0.7rem 1.1rem;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.9);
          transition: background-color .2s, border-color .2s;
          border-radius: 2px;
        }
        .ghost-cta-deep:hover { background-color: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.55); }
      `}</style>
    </section>
  );
}
