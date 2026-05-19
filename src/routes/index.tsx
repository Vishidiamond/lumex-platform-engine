import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import Galaxy from "@/components/galaxy/Galaxy";
import { BRAND_STOPS } from "@/components/galaxy/stops";

const SITE = "https://lumexconstellation.com";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Lumex Constellation" },
      {
        name: "description",
        content:
          "Lumex is rebuilding the diamond and jewelry industry from the ground up — owning the AI that designs it, the platform that trades it, and the brands that sell it.",
      },
      { property: "og:title", content: "Lumex Constellation" },
      {
        property: "og:description",
        content:
          "Four divisions. One sky. The future of diamonds and jewelry, mapped.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/` }],
  }),
});

function Index() {
  return (
    <ClientOnly
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-[#070b18] text-[#e6ecf7]">
          <p className="text-sm tracking-wide opacity-60">Loading galaxy…</p>
        </div>
      }
    >
      <GalaxyExperience />
    </ClientOnly>
  );
}

// IDs of selectable constellations in keyboard-cycle order (excludes "intro").
const BRAND_IDS = BRAND_STOPS.filter((s) => s.id !== "intro").map((s) => s.id);

function GalaxyExperience() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight / 2;
      let bestIdx = 0;
      let bestDist = Infinity;
      sectionRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });
      setActiveIndex(bestIdx);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollTo = (i: number) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Clicking a constellation in 3D selects it + navigates to its stop.
  const handleSelect = (id: string) => {
    const idx = BRAND_STOPS.findIndex((s) => s.id === id);
    setSelectedId(id);
    setFocusedId(id);
    if (idx >= 0) scrollTo(idx);
  };

  // Keyboard navigation: ←/→ or ↑/↓ cycle focus, Enter/Space selects, Esc clears.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const cycle = (dir: 1 | -1) => {
        e.preventDefault();
        const current = focusedId ?? selectedId;
        const idx = current ? BRAND_IDS.indexOf(current) : -1;
        const next =
          idx === -1
            ? dir === 1
              ? 0
              : BRAND_IDS.length - 1
            : (idx + dir + BRAND_IDS.length) % BRAND_IDS.length;
        setFocusedId(BRAND_IDS[next]);
      };

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "Tab":
          if (e.key === "Tab" && e.shiftKey) cycle(-1);
          else cycle(1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          cycle(-1);
          break;
        case "Enter":
        case " ":
          if (focusedId) {
            e.preventDefault();
            handleSelect(focusedId);
          }
          break;
        case "Escape":
          e.preventDefault();
          setSelectedId(null);
          setFocusedId(null);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedId, selectedId]);

  const selectedStop = selectedId
    ? BRAND_STOPS.find((s) => s.id === selectedId) ?? null
    : null;
  // Tooltip prefers mouse hover, falls back to keyboard focus.
  const tipId = hoveredId ?? focusedId;
  const hoveredStop = tipId
    ? BRAND_STOPS.find((s) => s.id === tipId) ?? null
    : null;

  return (
    <>
      <Galaxy
        activeIndex={activeIndex}
        selectedId={selectedId}
        focusedId={focusedId}
        onSelect={handleSelect}

        onHoverChange={setHoveredId}
      />

      {/* Top nav — click stops */}
      <nav className="fixed top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-center gap-1 px-4 py-4 text-[#e6ecf7]">
        {BRAND_STOPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => {
              scrollTo(i);
              if (s.id !== "intro") setSelectedId(s.id);
              else setSelectedId(null);
            }}
            className={
              "px-3 py-1.5 text-xs tracking-[0.18em] uppercase rounded-full transition " +
              (activeIndex === i
                ? "bg-white/15 text-white"
                : "text-white/55 hover:text-white/90 hover:bg-white/5")
            }
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* Hover tooltip — small label that follows hover state */}
      {hoveredStop && hoveredStop.id !== selectedId && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[#e6ecf7] text-xs tracking-[0.2em] uppercase">
            {hoveredStop.label}
          </div>
        </div>
      )}

      {/* Details panel — appears when a constellation is selected */}
      <aside
        className={
          "fixed right-6 top-1/2 -translate-y-1/2 z-30 w-[min(360px,calc(100vw-3rem))] " +
          "rounded-2xl border border-white/10 bg-[#0b1124]/80 backdrop-blur-xl p-6 " +
          "text-[#e6ecf7] shadow-2xl transition-all duration-500 " +
          (selectedStop
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-8 pointer-events-none")
        }
        aria-hidden={!selectedStop}
      >
        {selectedStop && (
          <>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">
                  {selectedStop.tagline ?? "Division"}
                </p>
                <h3 className="text-2xl font-light leading-tight">
                  {selectedStop.label}
                </h3>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="text-white/40 hover:text-white/90 text-lg leading-none"
                aria-label="Close details"
              >
                ×
              </button>
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              {selectedStop.blurb}
            </p>
          </>
        )}
      </aside>

      {/* Scroll-driven sections — one full viewport per stop */}
      <div className="relative z-10">
        {BRAND_STOPS.map((s, i) => (
          <section
            key={s.id}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            className="h-screen w-full flex items-end px-8 pb-24 pointer-events-none"
          >
            <div className="max-w-xl text-[#e6ecf7] pointer-events-auto">
              <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-3">
                {i === 0 ? "The Constellation" : `Stop ${i} / ${BRAND_STOPS.length - 1}`}
              </p>
              <h2 className="text-4xl md:text-5xl font-light leading-tight">
                {s.label}
              </h2>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

