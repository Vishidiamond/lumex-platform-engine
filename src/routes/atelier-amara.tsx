import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

const SITE = "https://lumexconstellation.com";

export const Route = createFileRoute("/atelier-amara")({
  component: AtelierAmaraPage,
  head: () => ({
    meta: [
      { title: "Atelier Amara — Modular fine jewelry | Lumex" },
      {
        name: "description",
        content:
          "Patented modular jewelry system. Owned IP, calibrated stones, designed in-house.",
      },
      { property: "og:title", content: "Atelier Amara — Modular fine jewelry | Lumex" },
      {
        property: "og:description",
        content:
          "Patented modular jewelry system. Owned IP, calibrated stones, designed in-house.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/atelier-amara` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/atelier-amara` }],
  }),
});

function AtelierAmaraPage() {
  return (
    <div className="text-[#e6ecf7]">
      <div
        style={{
          width: 160,
          padding: "18px 0",
          borderTop: "1px solid rgba(255,255,255,0.25)",
          borderBottom: "1px solid rgba(255,255,255,0.25)",
          fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
          letterSpacing: "0.32em",
          fontSize: 14,
          color: "rgba(255,255,255,0.9)",
          textAlign: "center",
        }}
      >
        ATELIER · AMARA
      </div>

      <p className="mt-8 text-[11px] uppercase tracking-[0.28em] text-white/55 font-mono">
        A house of brands · sub-brand
      </p>
      <h1 className="mt-4 text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
        Modular fine jewelry. Patented system.
      </h1>

      <div className="mt-8 space-y-5 text-base leading-relaxed text-white/85">
        <p style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "1.2rem", lineHeight: 1.55 }}>
          Atelier Amara is a refined, modular maison of fine jewelry — an
          elegant, contemporary system of forms designed to be lived in.
          Luxurious in finish and modular in architecture, so a piece adapts
          to its wearer rather than the other way around.
        </p>
        <p className="text-white/70">
          Half and full eternity is the most defensible category in fine
          jewelry. Sizing logic is repeatable. Stones are calibrated.
          Settings are modular. The same engineering produces a sized run,
          a special, and a refresh — at throughput.
        </p>
      </div>

      <div className="mt-10 border-t border-white/15 pt-8 flex items-end gap-6">
        <p className="text-4xl font-semibold tracking-tight text-white tabular-nums">1,000+</p>
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/55 font-mono pb-2">
          Proprietary styles
        </p>
      </div>

      <a
        href="https://atelieramara.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-12 inline-flex items-center gap-2 bg-white text-[#070b18] px-5 py-3 text-sm font-mono uppercase tracking-[0.24em] hover:bg-white/90 transition-colors"
      >
        Visit Atelier Amara <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );
}
