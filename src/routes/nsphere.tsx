import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

const SITE = "https://lumexconstellation.com";

export const Route = createFileRoute("/nsphere")({
  component: NspherePage,
  head: () => ({
    meta: [
      { title: "Nsphere — AI is the layer underneath | Lumex" },
      {
        name: "description",
        content:
          "Nsphere is the AI foundation of Lumex. CAD-merging patents and design generation at scale.",
      },
      { property: "og:title", content: "Nsphere — AI is the layer underneath | Lumex" },
      {
        property: "og:description",
        content:
          "Nsphere is the AI foundation of Lumex. CAD-merging patents and design generation at scale.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/nsphere` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/nsphere` }],
  }),
});

function NspherePage() {
  return (
    <div className="text-[#e6ecf7]">
      <div
        style={{
          width: 120,
          padding: "16px 0",
          borderTop: "1px solid rgba(255,255,255,0.2)",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.18em",
          fontSize: 11,
          color: "rgba(255,255,255,0.85)",
          textAlign: "center",
        }}
      >
        NSPHERE
      </div>

      <p className="mt-8 text-[11px] uppercase tracking-[0.28em] text-white/55 font-mono">
        Sphere · The patent layer
      </p>
      <h1 className="mt-4 text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
        AI is not a feature. It is the layer underneath.
      </h1>

      <div className="mt-8 space-y-5 text-base leading-relaxed text-white/75">
        <p>
          CAD merging takes two or more existing digital jewelry models and
          combines them — geometry, topology, constraints — into a new valid
          model. Nsphere holds the patent for performing this merge with AI
          in the loop.
        </p>
        <p>
          The generation extension covers how that same layer produces new
          designs from scratch. It is the mechanism the next decade of
          jewelry will be designed through, not a feature on top of one.
        </p>
        <p>
          Models compete. Patents compound. Owning the foundational IP for
          how the category designs is structurally different from owning a
          model that anyone can copy.
        </p>
      </div>

      <section className="mt-10 grid grid-cols-2 gap-6 border-t border-white/15 pt-8">
        <Stat v="30" l="Patented diamond shapes" />
        <Stat v="1,000+" l="Proprietary jewelry styles" />
        <Stat v="1" l="CAD merging patent" />
        <Stat v="1" l="Generation extension" />
      </section>

      <a
        href="https://nsphere.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-12 inline-flex items-center gap-2 bg-white text-[#070b18] px-5 py-3 text-sm font-mono uppercase tracking-[0.24em] hover:bg-white/90 transition-colors"
      >
        Visit Nsphere <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );
}

function Stat({ v, l }: { v: string; l: string }) {
  return (
    <div>
      <p className="text-3xl font-semibold tracking-tight text-white tabular-nums">{v}</p>
      <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-white/55 font-mono">{l}</p>
    </div>
  );
}
