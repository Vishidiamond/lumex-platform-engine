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

function GalaxyExperience() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);

  // IntersectionObserver: pick the section whose center is closest to viewport center.
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

  return (
    <>
      <Galaxy activeIndex={activeIndex} />

      {/* Top nav — click stops */}
      <nav className="fixed top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-center gap-1 px-4 py-4 text-[#e6ecf7]">
        {BRAND_STOPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => scrollTo(i)}
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
