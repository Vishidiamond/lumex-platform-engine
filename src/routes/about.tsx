import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Lumex" },
      {
        name: "description",
        content:
          "Lumex is a technology and platform company that has chosen diamonds and jewelry as the industry it will rebuild.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="text-[#e6ecf7]">
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/55 font-mono">
        About · Lumex
      </p>
      <h1 className="mt-4 text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
        Built by the trade. Engineered for what comes next.
      </h1>

      <div className="mt-8 space-y-5 text-base leading-relaxed text-white/75">
        <p>
          Lumex was founded in 2018 by Vishal Mehta. Backed by a century of
          trade experience in the natural diamond industry. Operated as a
          technology and platform company.
        </p>
        <p>
          Lumex is not a brand with a tech division. It is a technology and
          platform company that has chosen diamonds and jewelry as the
          industry it will rebuild. The lineage in the trade is what makes
          that rebuild credible.
        </p>
      </div>

      <section className="mt-10 border-t border-white/15 pt-8 space-y-8">
        <Leader
          name="Vishal Mehta"
          role="CEO · Founder"
          bio="Founded Lumex in 2018 after operating inside Rosy Blue, one of the largest natural diamond manufacturers in the world. Works from Dubai, with operations in India and the U.S."
        />
        <Leader
          name="Dilip Mehta"
          role="Advisor"
          bio="Led Rosy Blue across multiple decades and helped shape the modern global diamond trade. Advises Lumex on sourcing, manufacturing, distribution, and trade relationships."
        />
      </section>

      <section className="mt-10 border-t border-white/15 pt-8 grid grid-cols-2 gap-6">
        <Stat v="200+" l="Active clients" />
        <Stat v="20+" l="Geographies" />
        <Stat v="100+" l="Years of trade experience" />
        <Stat v="Dubai" l="Headquarters" />
      </section>
    </div>
  );
}

function Leader({ name, role, bio }: { name: string; role: string; bio: string }) {
  return (
    <div>
      <p className="text-lg font-semibold text-white">{name}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-white/55 font-mono">
        {role}
      </p>
      <p className="mt-3 text-sm text-white/75 leading-relaxed">{bio}</p>
    </div>
  );
}

function Stat({ v, l }: { v: string; l: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold text-white tabular-nums">{v}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-white/55 font-mono">{l}</p>
    </div>
  );
}
