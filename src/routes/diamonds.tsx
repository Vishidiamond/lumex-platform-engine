import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  DeepDivePage,
  DeepDiveHero,
  Beat,
  Contrast,
  PageCloser,
  ContinueJourney,
  usePulseControl,
} from "@/components/site/DeepDive";
import { cn } from "@/lib/utils";

const SITE = "https://lumexconstellation.com";

export const Route = createFileRoute("/diamonds")({
  component: DiamondsPage,
  head: () => ({
    meta: [
      { title: "Diamonds — Lumex" },
      {
        name: "description",
        content:
          "Calibrated, machine-sorted, engineered for precision. 30 patented shapes. Tight tolerances. Defensible cuts.",
      },
      { property: "og:title", content: "Diamonds — Lumex" },
      {
        property: "og:description",
        content: "Lumex loose diamonds, built to defensible tolerances.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/diamonds` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/diamonds` }],
  }),
});

/* Lattice star indexing: 7 cols x 4 rows. star(c, r) = r * 7 + c. */
const star = (c: number, r: number) => r * 7 + c;

function DiamondsPage() {
  return (
    <DeepDivePage division="lattice">
      <DeepDiveHero
        num="03"
        name="Lattice"
        headline="Calibrated. Machine-sorted. Engineered for precision."
        subhead="Lumex loose diamonds are built to defensible tolerances, not described in adjectives."
      />

      {/* BEAT 1 — 30 patented shapes; hover-driven pulse */}
      <Beat
        eyebrow="The 30 patented shapes"
        headline="30 patented shapes."
        pulses={[]}
      >
        <p
          className="mb-10 text-base uppercase text-white/60"
          style={{ letterSpacing: "0.24em", fontFamily: "var(--font-mono)" }}
        >
          Differentiation is engineered, not claimed.
        </p>
        <p className="mb-12 max-w-3xl text-lg leading-relaxed text-white/75">
          A patented shape is the difference between a commodity stone and a
          defensible product. Each cut in the catalog is geometrically defined,
          owned, and reproducible at tolerance.
        </p>
        <ShapeGrid />
      </Beat>

      {/* BEAT 2 — Grown. Sorted. Cut. */}
      <Beat
        eyebrow="How they're produced"
        headline="Grown. Sorted. Cut."
        pulses={[star(1, 0), star(3, 1), star(5, 2)]}
      >
        <ProductionSequence />
      </Beat>

      {/* BEAT 3 — The sorting layer */}
      <Beat
        eyebrow="The sorting layer"
        headline="The sorting layer."
        pulses={[star(0, 1), star(3, 1), star(6, 1), star(0, 2), star(3, 2), star(6, 2)]}
      >
        <div className="grid max-w-5xl gap-10 text-lg leading-relaxed text-white/75 md:grid-cols-2 md:gap-16">
          <p>
            Automated sorting machines classify fancy-shape and round diamonds
            for measurement and proportion. Throughput is high. Tolerances are
            tight. The output of every shift looks like the output of every
            other shift.
          </p>
          <p>
            Consistency at scale is an engineering outcome, not a craft
            outcome. The sorting layer is what allows the catalog to behave
            like a calibrated component supply, not a basket of unique stones.
          </p>
        </div>
      </Beat>

      {/* BEAT 4 — Catalog */}
      <Beat
        eyebrow="The catalog"
        headline="The catalog."
        pulses={[star(0, 0), star(2, 0), star(4, 0), star(6, 0), star(1, 3), star(5, 3)]}
      >
        <CatalogGrid />
      </Beat>

      {/* BEAT 5 — Contrast block */}
      <section className="relative px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Contrast not="We don't sell stones —" then="we sell precision." />
          <Contrast not="Not to be broad —" then="to be the best." />
        </div>
      </section>

      <PageCloser line="Precision is the product." />

      <ContinueJourney to="/brands" label="Continue the journey →" />
    </DeepDivePage>
  );
}

/* ─────────── Local parts ─────────── */

interface Shape {
  name: string;
  paths: string[];
  starIdx: number;
}

const SHAPES: Shape[] = [
  // 12 wireframe CAD-style placeholders. viewBox 0..100. Lines = facet edges.
  // Round
  { name: "Round 01", starIdx: star(1, 0), paths: ["M50 8 L80 30 L92 50 L80 70 L50 92 L20 70 L8 50 L20 30 Z", "M50 8 L50 92", "M8 50 L92 50", "M20 30 L80 70", "M80 30 L20 70"] },
  { name: "Round 02", starIdx: star(3, 0), paths: ["M50 10 L88 50 L50 90 L12 50 Z", "M50 10 L50 90", "M12 50 L88 50", "M30 22 L70 78", "M70 22 L30 78"] },
  { name: "Princess", starIdx: star(5, 0), paths: ["M14 14 L86 14 L86 86 L14 86 Z", "M14 14 L86 86", "M86 14 L14 86", "M50 14 L50 86", "M14 50 L86 50"] },
  { name: "Cushion 01", starIdx: star(0, 1), paths: ["M22 14 L78 14 Q92 14 92 28 L92 72 Q92 86 78 86 L22 86 Q8 86 8 72 L8 28 Q8 14 22 14 Z", "M22 14 L78 86", "M78 14 L22 86", "M50 14 L50 86"] },
  { name: "Oval", starIdx: star(2, 1), paths: ["M50 8 Q92 50 50 92 Q8 50 50 8 Z", "M8 50 L92 50", "M50 8 L50 92", "M22 22 L78 78", "M78 22 L22 78"] },
  { name: "Pear", starIdx: star(4, 1), paths: ["M50 8 Q88 38 76 70 Q60 92 50 92 Q40 92 24 70 Q12 38 50 8 Z", "M50 8 L50 92", "M22 50 L78 50", "M30 35 L70 65"] },
  { name: "Marquise", starIdx: star(6, 1), paths: ["M50 8 Q92 50 50 92 Q8 50 50 8 Z", "M50 8 L50 92", "M8 50 L92 50", "M22 30 L78 70"] },
  { name: "Emerald", starIdx: star(0, 2), paths: ["M22 12 L78 12 L92 26 L92 74 L78 88 L22 88 L8 74 L8 26 Z", "M22 12 L22 88", "M78 12 L78 88", "M50 12 L50 88"] },
  { name: "Radiant", starIdx: star(2, 2), paths: ["M22 14 L78 14 L92 30 L92 70 L78 86 L22 86 L8 70 L8 30 Z", "M22 14 L78 86", "M78 14 L22 86", "M50 14 L50 86", "M8 50 L92 50"] },
  { name: "Asscher", starIdx: star(4, 2), paths: ["M28 14 L72 14 L86 28 L86 72 L72 86 L28 86 L14 72 L14 28 Z", "M28 14 L72 86", "M72 14 L28 86", "M14 50 L86 50", "M50 14 L50 86"] },
  { name: "Heart", starIdx: star(6, 2), paths: ["M50 88 Q12 60 12 32 Q12 14 30 14 Q44 14 50 28 Q56 14 70 14 Q88 14 88 32 Q88 60 50 88 Z", "M50 28 L50 88", "M20 36 L80 36"] },
  { name: "Trillion", starIdx: star(3, 3), paths: ["M50 12 L92 80 L8 80 Z", "M50 12 L50 80", "M30 46 L70 46", "M30 80 L50 12", "M70 80 L50 12"] },
];

function ShapeGrid() {
  const setPulse = usePulseControl();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6"
      onMouseLeave={() => {
        setPulse([]);
        setHovered(null);
      }}
    >
      {SHAPES.map((s, i) => {
        const isOn = hovered === i;
        return (
          <button
            type="button"
            key={s.name}
            onMouseEnter={() => {
              setHovered(i);
              setPulse([s.starIdx]);
            }}
            onFocus={() => {
              setHovered(i);
              setPulse([s.starIdx]);
            }}
            onBlur={() => {
              setHovered(null);
              setPulse([]);
            }}
            className={cn(
              "group relative aspect-square border border-white/15 bg-white/[0.02] p-3 text-left transition-colors",
              "hover:bg-white/[0.05] focus:outline-none focus:bg-white/[0.05]",
            )}
            aria-label={s.name}
          >
            <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
              <g
                fill="none"
                stroke={isOn ? "rgba(220, 232, 255, 0.95)" : "rgba(180, 210, 255, 0.55)"}
                strokeWidth={0.6}
                style={{ transition: "stroke 0.2s ease" }}
              >
                {s.paths.map((d, j) => (
                  <path key={j} d={d} />
                ))}
              </g>
            </svg>
            <span
              className="absolute bottom-2 left-3 text-[10px] uppercase text-white/45"
              style={{ letterSpacing: "0.22em", fontFamily: "var(--font-mono)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
          </button>
        );
      })}
      <div className="col-span-3 flex items-center justify-end pt-2 sm:col-span-4 md:col-span-6">
        <p
          className="text-[11px] uppercase text-white/45"
          style={{ letterSpacing: "0.24em", fontFamily: "var(--font-mono)" }}
        >
          12 of 30 shown · Catalog continues
        </p>
      </div>
    </div>
  );
}

function ProductionSequence() {
  const steps = [
    {
      n: "01",
      title: "Grown",
      line: "HPHT growth under defined pressure and temperature, in controlled cycles.",
    },
    {
      n: "02",
      title: "Sorted",
      line: "Calibrated, machine-sorted by measurement and proportion. High throughput, tight tolerance.",
    },
    {
      n: "03",
      title: "Cut",
      line: "To defined cuts and tolerances. Geometry is the spec. The spec is the deliverable.",
    },
  ];
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute left-0 right-0 top-3 hidden h-px bg-white/15 md:block"
      />
      <div className="relative grid gap-10 md:grid-cols-3 md:gap-8">
        {steps.map((s) => (
          <div key={s.n}>
            <span aria-hidden className="block h-2 w-2 rounded-full bg-white" style={{ marginTop: "0.5rem" }} />
            <p
              className="mt-5 text-[11px] uppercase text-white/55"
              style={{ letterSpacing: "0.28em", fontFamily: "var(--font-mono)" }}
            >
              {s.n} · {s.title}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/80">{s.line}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CatalogGrid() {
  const tiles = [
    {
      title: "Special Cuts",
      l1: "Patented geometries unique to Lumex.",
      l2: "For brands that want a defensible signature.",
    },
    {
      title: "Small Diamonds",
      l1: "Calibrated melee at high throughput.",
      l2: "For pavé, halo, and modular settings at volume.",
    },
    {
      title: "Ideal Cuts",
      l1: "Round geometry held to ideal proportions.",
      l2: "For solitaires and engagement programs.",
    },
    {
      title: "Triple Excellent",
      l1: "Cut, polish, and symmetry all graded excellent.",
      l2: "For top-tier inventory at consistent grade.",
    },
    {
      title: "Fancy Shapes",
      l1: "Non-round geometries, machine-sorted to spec.",
      l2: "For designers building outside the round category.",
    },
    {
      title: "Fancy Colors",
      l1: "Defined color sets at calibrated grade.",
      l2: "For programs that need color consistency at scale.",
    },
  ];
  return (
    <div className="grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-3">
      {tiles.map((t) => (
        <div key={t.title} className="bg-[#070b18] p-6 md:p-8">
          <p
            className="text-[11px] uppercase text-white/65"
            style={{ letterSpacing: "0.24em", fontFamily: "var(--font-mono)" }}
          >
            {t.title}
          </p>
          <p className="mt-4 text-base leading-relaxed text-white/85">{t.l1}</p>
          <p className="mt-2 text-sm leading-relaxed text-white/55">{t.l2}</p>
        </div>
      ))}
    </div>
  );
}
