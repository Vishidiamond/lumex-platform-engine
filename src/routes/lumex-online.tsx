import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

const SITE = "https://lumexconstellation.com";

export const Route = createFileRoute("/lumex-online")({
  component: LumexOnlinePage,
  head: () => ({
    meta: [
      { title: "Lumex.Online — The rails of the trade | Lumex" },
      {
        name: "description",
        content:
          "Not a marketplace. Not a website. Infrastructure. Lumex.Online is the layer the diamond category will run on.",
      },
      { property: "og:title", content: "Lumex.Online — The rails of the trade | Lumex" },
      {
        property: "og:description",
        content:
          "Not a marketplace. Not a website. Infrastructure. Lumex.Online is the layer the diamond category will run on.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/lumex-online` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/lumex-online` }],
  }),
});

function LumexOnlinePage() {
  return (
    <div className="text-[#e6ecf7]">
      <BrandMark label="LUMEX.ONLINE" />

      <p className="mt-8 text-[11px] uppercase tracking-[0.28em] text-white/55 font-mono">
        Rails · Infrastructure
      </p>
      <h1 className="mt-4 text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
        Not a marketplace. Not a website. Infrastructure.
      </h1>

      <div className="mt-8 space-y-5 text-base leading-relaxed text-white/75">
        <p>
          Lumex.online is the layer the category will run on. Stones, brands,
          and counterparties change. The rails do not. The company that owns
          the rails owns the flow on top of them.
        </p>
        <p>
          The platform is built as infrastructure first and product second —
          an open connective tissue between the people who price diamonds,
          the banks that finance them, and the logistics that move them.
        </p>
      </div>

      <section className="mt-10 grid grid-cols-1 gap-6">
        <NetworkCard label="Brokers" line="The lifeblood of the trade. Now with a digital path forward." />
        <NetworkCard label="Banks" line="Settlement and financing, integrated into the flow of trade." />
        <NetworkCard label="Logistics" line="Movement, insurance, and chain of custody — on the same layer." />
      </section>

      <section className="mt-10 border-t border-white/15 pt-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/45 font-mono mb-4">
          How it works
        </p>
        <ol className="space-y-4 text-sm text-white/80">
          <Step n="01" t="List" l="Inventory enters the platform with calibrated specs and verified provenance." />
          <Step n="02" t="Match" l="Counterparties find inventory by parameter, not by phone tree." />
          <Step n="03" t="Settle" l="Banking and settlement clear inside the same digital layer." />
          <Step n="04" t="Move" l="Shipment, insurance, and chain of custody execute on a connected pipeline." />
        </ol>
      </section>

      <a
        href="https://lumex.online"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-12 inline-flex items-center gap-2 bg-white text-[#070b18] px-5 py-3 text-sm font-mono uppercase tracking-[0.24em] hover:bg-white/90 transition-colors"
      >
        Visit Lumex.online <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );
}

function BrandMark({ label }: { label: string }) {
  return (
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
      {label}
    </div>
  );
}

function NetworkCard({ label, line }: { label: string; line: string }) {
  return (
    <div className="border-t border-white/15 pt-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-white/65 font-mono">
        {label}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-white/80">{line}</p>
    </div>
  );
}

function Step({ n, t, l }: { n: string; t: string; l: string }) {
  return (
    <li>
      <p className="text-[11px] uppercase tracking-[0.24em] text-white/55 font-mono">
        {n} · {t}
      </p>
      <p className="mt-1 text-white/80">{l}</p>
    </li>
  );
}
