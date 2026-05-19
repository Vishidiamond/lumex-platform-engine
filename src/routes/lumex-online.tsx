import { createFileRoute } from "@tanstack/react-router";
import { CONSTELLATIONS_BY_ID } from "@/galaxy/constellations";

const c = CONSTELLATIONS_BY_ID["lumex-online"];

export const Route = createFileRoute("/lumex-online")({
  component: LumexOnlinePage,
  head: () => ({
    meta: [
      { title: `${c.name} — ${c.tagline}` },
      { name: "description", content: c.blurb },
      { property: "og:title", content: `${c.name} — Lumex` },
      { property: "og:description", content: c.blurb },
    ],
  }),
});

function LumexOnlinePage() {
  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-end px-8 pb-24 pointer-events-none">
      <div className="max-w-xl text-[#e6ecf7] pointer-events-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-3">
          {c.tagline}
        </p>
        <h1 className="text-5xl md:text-6xl font-light leading-tight mb-6">
          {c.name}
        </h1>
        <p className="text-base text-white/70 leading-relaxed">{c.blurb}</p>
      </div>
    </section>
  );
}
