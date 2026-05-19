import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

const SITE = "https://lumexconstellation.com";

export const Route = createFileRoute("/fortunoff")({
  component: FortunoffPage,
  head: () => ({
    meta: [
      { title: "Fortunoff — Heritage rebuilt on modern rails | Lumex" },
      {
        name: "description",
        content:
          "A heritage brand reborn on the Lumex platform — taking the classic and making it iconic.",
      },
      { property: "og:title", content: "Fortunoff — Heritage rebuilt on modern rails | Lumex" },
      {
        property: "og:description",
        content:
          "A heritage brand reborn on the Lumex platform — taking the classic and making it iconic.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/fortunoff` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/fortunoff` }],
  }),
});

function FortunoffPage() {
  return (
    <div className="text-[#e6ecf7]">
      <div
        style={{
          width: 140,
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
        FORTUNOFF
      </div>

      <p className="mt-8 text-[11px] uppercase tracking-[0.28em] text-white/55 font-mono">
        A house of brands · sub-brand
      </p>
      <h1 className="mt-4 text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
        Heritage, rebuilt on modern rails.
      </h1>

      <div className="mt-8 space-y-5 text-base leading-relaxed text-white/85">
        <p style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "1.2rem", lineHeight: 1.55 }}>
          Fortunoff is the licensed U.S. heritage revival — an American
          jewelry name with deep customer recognition, brought back on modern
          rails. The voice is warm and familiar; the back-end is engineered,
          automated, and shared with the rest of the house.
        </p>
        <p className="text-white/70">
          Lumex is the engineering, technology, and capital layer underneath
          every brand in the house. The platform is shared. The patents are
          shared. The factory floor is shared. Each sub-brand has its own
          voice for its own audience.
        </p>
      </div>

      <a
        href="https://fortunoff.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-12 inline-flex items-center gap-2 bg-white text-[#070b18] px-5 py-3 text-sm font-mono uppercase tracking-[0.24em] hover:bg-white/90 transition-colors"
      >
        Visit Fortunoff <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );
}
