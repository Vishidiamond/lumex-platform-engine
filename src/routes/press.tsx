import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/press")({
  head: () => ({
    meta: [
      { title: "Press — Lumex" },
      { name: "description", content: "Press resources for Lumex: boilerplate, coverage, brand assets, and media contact." },
    ],
  }),
  component: PressPage,
});

const BOILERPLATE =
  "Lumex is a technology and platform company rebuilding the diamond and jewelry industry from the ground up. Not a brand with a tech division — a platform company that owns the AI that designs the product, the rails that trade it, and the brands that sell it. Founded in 2018, headquartered in Dubai, operating across 20+ geographies with 200+ active clients.";

function PressPage() {
  return (
    <div className="text-[#e6ecf7]">
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/55 font-mono">
        Press · Lumex
      </p>
      <h1 className="mt-4 text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
        Press &amp; resources.
      </h1>
      <p className="mt-6 text-base text-white/75">
        For media inquiries, contact{" "}
        <a
          href="mailto:press@lumexgroup.com"
          className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
        >
          press@lumexgroup.com
        </a>
        .
      </p>

      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/45 font-mono">
            Boilerplate · 60 words
          </p>
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                void navigator.clipboard.writeText(BOILERPLATE);
              }
            }}
            className="text-[11px] uppercase tracking-[0.24em] text-white/55 hover:text-white font-mono"
          >
            Copy
          </button>
        </div>
        <blockquote className="mt-4 border-l-2 border-white/30 bg-white/[0.03] p-5 text-sm leading-relaxed text-white">
          {BOILERPLATE}
        </blockquote>
      </section>

      <section className="mt-10 border-t border-white/15 pt-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/45 font-mono mb-4">
          Fact sheet
        </p>
        <ul className="divide-y divide-white/10 border-y border-white/15">
          {[
            ["Founded", "2018"],
            ["Headquarters", "Dubai"],
            ["Operations", "India, U.S."],
            ["Active clients", "200+"],
            ["Geographies", "20+"],
            ["Patented diamond shapes", "30"],
            ["Proprietary jewelry styles", "1,000+"],
          ].map(([k, v]) => (
            <li key={k} className="flex justify-between gap-4 py-3 text-sm">
              <span className="text-[11px] uppercase tracking-[0.24em] text-white/55 font-mono">{k}</span>
              <span className="text-white text-right">{v}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
