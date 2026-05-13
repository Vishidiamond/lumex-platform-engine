import { createFileRoute } from "@tanstack/react-router";
import { Download, ExternalLink } from "lucide-react";
import { Starfield } from "@/components/site/Starfield";

export const Route = createFileRoute("/press")({
  head: () => ({
    meta: [
      { title: "Press & resources — Lumex" },
      {
        name: "description",
        content:
          "Press resources for Lumex: boilerplate, coverage, brand assets, fact sheet, and media contact.",
      },
      { property: "og:title", content: "Press & resources — Lumex" },
      {
        property: "og:description",
        content:
          "Boilerplate, coverage, brand assets, and fact sheet for journalists and analysts.",
      },
      { property: "og:url", content: "https://lumexconstellation.com/press" },
    ],
  }),
  component: PressPage,
});

const MONO = { fontFamily: "var(--font-mono)" } as const;

const BOILERPLATE =
  "Lumex is a technology and platform company rebuilding the diamond and jewelry industry from the ground up. Not a brand with a tech division — a platform company that owns the AI that designs the product, the rails that trade it, and the brands that sell it. Founded in 2018, headquartered in Dubai, operating across 20+ geographies with 200+ active clients.";

const COVERAGE: { publication: string; headline: string; date: string; href: string }[] = [
  { publication: "[Publication]", headline: "[Headline placeholder — feature on Lumex platform launch.]", date: "[Month YYYY]", href: "#" },
  { publication: "[Publication]", headline: "[Headline placeholder — NSphere patent coverage.]", date: "[Month YYYY]", href: "#" },
  { publication: "[Publication]", headline: "[Headline placeholder — Atelier Amara launch.]", date: "[Month YYYY]", href: "#" },
  { publication: "[Publication]", headline: "[Headline placeholder — Fortunoff revival.]", date: "[Month YYYY]", href: "#" },
  { publication: "[Publication]", headline: "[Headline placeholder — interview with Vishal Mehta.]", date: "[Month YYYY]", href: "#" },
  { publication: "[Publication]", headline: "[Headline placeholder — industry analysis.]", date: "[Month YYYY]", href: "#" },
];

const ASSETS: { label: string; meta: string; href: string }[] = [
  { label: "Lumex logomark", meta: "SVG · PNG · reversed-out", href: "#" },
  { label: "Secondary brand pattern", meta: "SVG · PNG", href: "#" },
  { label: "Color values", meta: "Spot · print · digital", href: "#" },
  { label: "Leadership headshots", meta: "Vishal Mehta · Dilip Mehta", href: "#" },
  { label: "Company fact sheet", meta: "One-page PDF", href: "#" },
];

const FACTS: { label: string; value: string }[] = [
  { label: "Founded", value: "2018" },
  { label: "Headquarters", value: "Dubai" },
  { label: "Operations", value: "India, U.S." },
  { label: "Active clients", value: "200+" },
  { label: "Geographies", value: "20+" },
  { label: "Patented diamond shapes", value: "30" },
  { label: "Proprietary jewelry styles", value: "1,000+" },
  { label: "Foundational IP", value: "NSphere CAD merging patent + generation extension" },
  { label: "Sub-brands", value: "Atelier Amara (in-house luxury modular), Fortunoff (licensed U.S. revival)" },
  { label: "Platform", value: "Lumex.online" },
];

function PressPage() {
  return (
    <div className="relative min-h-screen bg-[#070b18] text-[#e6ecf7]">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
        <Starfield />
      </div>

      <div className="relative z-10">
        {/* 1. Hero */}
        <header className="px-6 pb-16 pt-32 md:px-10 md:pt-44">
          <div className="mx-auto max-w-5xl">
            <p
              className="text-xs uppercase text-white/55"
              style={{ ...MONO, letterSpacing: "0.32em" }}
            >
              Press · Lumex
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
              Press &amp; resources.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-white/70">
              For media inquiries, contact{" "}
              <a
                href="mailto:press@lumexgroup.com"
                className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
              >
                press@lumexgroup.com
              </a>
              .
            </p>
          </div>
        </header>

        {/* 2. Boilerplate */}
        <section className="border-t border-white/10 px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-baseline justify-between gap-6">
              <p
                className="text-xs uppercase text-white/45"
                style={{ ...MONO, letterSpacing: "0.28em" }}
              >
                Boilerplate · 60 words
              </p>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    void navigator.clipboard.writeText(BOILERPLATE);
                  }
                }}
                className="text-[11px] uppercase text-white/55 transition-colors hover:text-white"
                style={{ ...MONO, letterSpacing: "0.24em" }}
              >
                Copy
              </button>
            </div>
            <blockquote className="mt-8 border-l-2 border-white/30 bg-white/[0.03] p-8 text-lg leading-relaxed text-white md:text-xl">
              {BOILERPLATE}
            </blockquote>
          </div>
        </section>

        {/* 3. Recent coverage */}
        <section className="border-t border-white/10 px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-6xl">
            <p
              className="text-xs uppercase text-white/45"
              style={{ ...MONO, letterSpacing: "0.28em" }}
            >
              Recent coverage
            </p>
            <ul className="mt-10 grid grid-cols-1 gap-x-12 md:grid-cols-2">
              {COVERAGE.map((item, i) => (
                <li
                  key={i}
                  className="border-b border-white/10 py-6 first:border-t md:[&:nth-child(2)]:border-t"
                >
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start justify-between gap-4"
                  >
                    <div>
                      <p
                        className="text-[11px] uppercase text-white/55"
                        style={{ ...MONO, letterSpacing: "0.24em" }}
                      >
                        {item.publication} · {item.date}
                      </p>
                      <p className="mt-2 text-base text-white/85 transition-colors group-hover:text-white md:text-lg">
                        {item.headline}
                      </p>
                    </div>
                    <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-white/40 transition-colors group-hover:text-white" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. Brand assets */}
        <section className="border-t border-white/10 px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-6xl">
            <p
              className="text-xs uppercase text-white/45"
              style={{ ...MONO, letterSpacing: "0.28em" }}
            >
              Brand assets
            </p>
            <ul className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2">
              {ASSETS.map((a) => (
                <li key={a.label}>
                  <a
                    href={a.href}
                    className="group flex items-center justify-between gap-4 border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/30 hover:bg-white/[0.05]"
                  >
                    <div>
                      <p className="text-base text-white md:text-lg">{a.label}</p>
                      <p
                        className="mt-1 text-[11px] uppercase text-white/50"
                        style={{ ...MONO, letterSpacing: "0.24em" }}
                      >
                        {a.meta}
                      </p>
                    </div>
                    <Download className="h-4 w-4 shrink-0 text-white/40 transition-colors group-hover:text-white" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 5. Fact sheet inline */}
        <section className="border-t border-white/10 px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-5xl">
            <p
              className="text-xs uppercase text-white/45"
              style={{ ...MONO, letterSpacing: "0.28em" }}
            >
              Fact sheet
            </p>
            <ol className="mt-10 divide-y divide-white/10 border-y border-white/15">
              {FACTS.map((f, i) => (
                <li key={f.label} className="grid grid-cols-[2.5rem_1fr] gap-4 py-5 md:grid-cols-[3rem_14rem_1fr] md:gap-8">
                  <span
                    className="text-[11px] uppercase text-white/40 tabular-nums"
                    style={{ ...MONO, letterSpacing: "0.24em", fontFeatureSettings: "'tnum'" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="hidden text-[11px] uppercase text-white/55 md:block md:self-center"
                    style={{ ...MONO, letterSpacing: "0.24em" }}
                  >
                    {f.label}
                  </span>
                  <div>
                    <p
                      className="mb-1 text-[11px] uppercase text-white/55 md:hidden"
                      style={{ ...MONO, letterSpacing: "0.24em" }}
                    >
                      {f.label}
                    </p>
                    <p className="text-base text-white md:text-lg">{f.value}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 6. Press contact */}
        <section className="border-t border-white/10 px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-5xl">
            <p
              className="text-xs uppercase text-white/45"
              style={{ ...MONO, letterSpacing: "0.28em" }}
            >
              Press contact
            </p>
            <dl className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div>
                <dt
                  className="text-[11px] uppercase text-white/50"
                  style={{ ...MONO, letterSpacing: "0.24em" }}
                >
                  Name
                </dt>
                <dd className="mt-2 text-base text-white md:text-lg">[Press contact name]</dd>
              </div>
              <div>
                <dt
                  className="text-[11px] uppercase text-white/50"
                  style={{ ...MONO, letterSpacing: "0.24em" }}
                >
                  Email
                </dt>
                <dd className="mt-2 text-base md:text-lg">
                  <a
                    href="mailto:press@lumexgroup.com"
                    className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
                  >
                    press@lumexgroup.com
                  </a>
                </dd>
              </div>
              <div>
                <dt
                  className="text-[11px] uppercase text-white/50"
                  style={{ ...MONO, letterSpacing: "0.24em" }}
                >
                  Phone
                </dt>
                <dd className="mt-2 text-base text-white md:text-lg">[+000 0 000 0000]</dd>
              </div>
            </dl>
          </div>
        </section>

        <div className="h-24" />
      </div>
    </div>
  );
}
