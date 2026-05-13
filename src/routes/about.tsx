import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Starfield } from "@/components/site/Starfield";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Lumex" },
      {
        name: "description",
        content:
          "Lumex is a technology and platform company that has chosen diamonds and jewelry as the industry it will rebuild. Founded in 2018 by Vishal Mehta, backed by a century of trade experience.",
      },
      { property: "og:title", content: "About — Lumex" },
      {
        property: "og:description",
        content:
          "A technology and platform company that has chosen diamonds and jewelry as the industry it will rebuild.",
      },
      { property: "og:url", content: "https://lumexconstellation.com/about" },
      { rel: "canonical", href: "https://lumexconstellation.com/about" } as never,
    ],
  }),
  component: AboutPage,
});

const MONO = { fontFamily: "var(--font-mono)" } as const;

function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#070b18] text-[#e6ecf7]">
      {/* Faint atmospheric starfield only — no overhead constellation, no rail. */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
        <Starfield />
      </div>

      <div className="relative z-10">
        {/* 1. Hero */}
        <header className="px-6 pb-20 pt-32 md:px-10 md:pt-44">
          <div className="mx-auto max-w-5xl">
            <p
              className="text-xs uppercase text-white/55"
              style={{ ...MONO, letterSpacing: "0.32em" }}
            >
              About · Lumex
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
              Built by the trade. Engineered for what comes next.
            </h1>
            <p className="mt-8 max-w-2xl text-lg text-white/70">
              Lumex was founded in 2018 by Vishal Mehta. Backed by a century of
              trade experience in the natural diamond industry. Operated as a
              technology and platform company.
            </p>
          </div>
        </header>

        {/* 2. The thesis */}
        <section className="border-t border-white/10 px-6 py-24 md:px-10 md:py-32">
          <div className="mx-auto max-w-5xl">
            <p
              className="text-xs uppercase text-white/45"
              style={{ ...MONO, letterSpacing: "0.28em" }}
            >
              The thesis
            </p>
            <p className="mt-8 max-w-4xl text-2xl font-light leading-snug text-white md:text-4xl">
              Lumex is not a brand with a tech division. It is a technology and
              platform company that has chosen diamonds and jewelry as the
              industry it will rebuild. The lineage in the trade is what makes
              that rebuild credible.
            </p>
          </div>
        </section>

        {/* 3. Leadership */}
        <section className="border-t border-white/10 px-6 py-24 md:px-10 md:py-32">
          <div className="mx-auto max-w-6xl">
            <p
              className="text-xs uppercase text-white/45"
              style={{ ...MONO, letterSpacing: "0.28em" }}
            >
              Leadership
            </p>
            <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-16">
              <LeaderBlock
                initials="VM"
                name="Vishal Mehta"
                role="CEO · Founder"
                bio={[
                  "Vishal Mehta founded Lumex in 2018 after operating inside Rosy Blue, one of the largest natural diamond manufacturers in the world.",
                  "He builds Lumex as a technology and platform company, with engineering, IP, and category ownership as the operating model.",
                  "He works from Dubai, with operations in India and the United States.",
                ]}
              />
              <LeaderBlock
                initials="DM"
                name="Dilip Mehta"
                role="Advisor"
                bio={[
                  "Dilip Mehta led Rosy Blue across multiple decades and helped shape the modern global diamond trade.",
                  "He advises Lumex on the structural realities of the industry: sourcing, manufacturing, distribution, and trade relationships.",
                  "His role is counsel, not operations.",
                ]}
              />
            </div>
          </div>
        </section>

        {/* 4. Posture toward the industry */}
        <section className="border-t border-white/10 px-6 py-24 md:px-10 md:py-32">
          <div className="mx-auto max-w-5xl">
            <h2 className="max-w-3xl text-3xl font-semibold leading-[1.08] tracking-tight text-white md:text-5xl">
              Respect for the industry we came from.
            </h2>
            <div className="mt-12 grid gap-12 text-base leading-relaxed text-white/75 md:grid-cols-2 md:gap-16 md:text-lg">
              <div>
                <p
                  className="mb-4 text-[11px] uppercase text-white/45"
                  style={{ ...MONO, letterSpacing: "0.28em" }}
                >
                  On natural diamonds
                </p>
                <p>
                  The lab-grown category exists because the natural diamond
                  industry spent over 100 years building the cultural meaning
                  of "diamond." That work is the foundation every lab-grown
                  company stands on, including Lumex. Lumex competes on
                  precision, technology, IP, and design — never by tearing
                  down the lineage that made the category possible. This is a
                  permanent posture, not a marketing choice.
                </p>
              </div>
              <div>
                <p
                  className="mb-4 text-[11px] uppercase text-white/45"
                  style={{ ...MONO, letterSpacing: "0.28em" }}
                >
                  On brokers and partners
                </p>
                <p>
                  Brokers are the lifeblood of the trade. Banks, logistics,
                  and retail partners are participants in what Lumex is
                  building, not obstacles. The platform is designed to make
                  their work faster, cleaner, and more accountable — not to
                  route around them.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. By the numbers */}
        <section className="border-t border-white/10 px-6 py-24 md:px-10 md:py-32">
          <div className="mx-auto max-w-6xl">
            <p
              className="text-xs uppercase text-white/45"
              style={{ ...MONO, letterSpacing: "0.28em" }}
            >
              By the numbers
            </p>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 border-y border-white/15 py-10 md:grid-cols-5">
              {[
                { value: "200+", label: "Active clients" },
                { value: "20+", label: "Geographies" },
                { value: "100+", label: "Years of trade experience" },
                { value: "Dubai", label: "Headquarters" },
                { value: "IN · US", label: "Operations" },
              ].map((it) => (
                <div key={it.label}>
                  <p
                    className="text-3xl font-semibold tracking-tight text-white tabular-nums md:text-4xl"
                    style={{ fontFeatureSettings: "'tnum'" }}
                  >
                    {it.value}
                  </p>
                  <p
                    className="mt-3 text-[11px] uppercase text-white/55"
                    style={{ ...MONO, letterSpacing: "0.24em" }}
                  >
                    {it.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Contrast block */}
        <section className="px-6 py-20 md:px-10 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="border-y border-white/10 py-10">
              <p className="max-w-5xl text-2xl font-light leading-snug text-white/55 md:text-4xl">
                Not a brand with a tech division —
              </p>
              <p className="mt-3 max-w-5xl text-2xl font-semibold leading-snug text-white md:text-4xl">
                a technology and platform company that has chosen diamonds.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Closer + CTA */}
        <section className="px-6 py-32 text-center md:px-10">
          <p
            className="mx-auto max-w-3xl text-xl uppercase text-white md:text-2xl"
            style={{ ...MONO, letterSpacing: "0.32em" }}
          >
            The future is the work.
          </p>
          <div className="mt-14 flex justify-center">
            <Link to="/" className="ghost-cta-about">
              Return to the journey
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <style>{`
            .ghost-cta-about {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              border: 1px solid rgba(255,255,255,0.25);
              padding: 0.7rem 1.1rem;
              font-size: 0.875rem;
              color: rgba(255,255,255,0.9);
              transition: background-color .2s, border-color .2s;
              border-radius: 2px;
            }
            .ghost-cta-about:hover {
              background-color: rgba(255,255,255,0.06);
              border-color: rgba(255,255,255,0.55);
            }
          `}</style>
        </section>
      </div>
    </div>
  );
}

function LeaderBlock({
  initials,
  name,
  role,
  bio,
}: {
  initials: string;
  name: string;
  role: string;
  bio: string[];
}) {
  return (
    <div>
      <div className="flex items-center gap-5">
        <div
          aria-hidden
          className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/[0.03] text-base font-medium tracking-wide text-white/80"
          style={MONO}
        >
          {initials}
        </div>
        <div>
          <p className="text-xl font-semibold tracking-tight text-white md:text-2xl">
            {name}
          </p>
          <p
            className="mt-1 text-[11px] uppercase text-white/55"
            style={{ ...MONO, letterSpacing: "0.28em" }}
          >
            {role}
          </p>
        </div>
      </div>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-white/75 md:text-lg">
        {bio.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
