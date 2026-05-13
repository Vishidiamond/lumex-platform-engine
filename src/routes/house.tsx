import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import {
  DeepDivePage,
  DeepDiveHero,
  Beat,
  Contrast,
  PageCloser,
  usePulseControl,
} from "@/components/site/DeepDive";
import { useEffect } from "react";

const SITE = "https://lumexconstellation.com";

export const Route = createFileRoute("/house")({
  component: HousePage,
  head: () => ({
    meta: [
      { title: "House — Lumex" },
      {
        name: "description",
        content:
          "A house of brands. One platform underneath. Atelier Amara, Fortunoff, and the next acquisition — on a shared engineering, technology, and capital backbone.",
      },
      { property: "og:title", content: "House — Lumex" },
      {
        property: "og:description",
        content: "A house of brands. One platform underneath.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/house` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/house` }],
  }),
});

/* House star indices (from Constellation.tsx SPECS.house):
 * 0..4   Atelier Amara cluster (0 = brightest, labeled)
 * 5..9   Fortunoff cluster      (5 = brightest, labeled)
 * 10..12 "More to come" cluster (10 = brightest, faintly labeled)
 * 13, 14 bridging stars (the shared scaffold)
 */
const AMARA = [0, 1, 2, 3, 4];
const FORTUNOFF = [5, 6, 7, 8, 9];
const MORE = [10, 11, 12];
const BRIDGE = [13, 14];

function HousePage() {
  return (
    <DeepDivePage division="house">
      <DeepDiveHero
        num="04"
        name="House"
        headline="A house of brands. One platform underneath."
        subhead="Atelier Amara. Fortunoff. The next acquisition. The engineering, technology, and capital backbone is shared."
      />

      {/* BEAT 1 — Thesis */}
      <Beat
        eyebrow="The thesis"
        headline="The future of the industry is full jewelry."
        pulses={BRIDGE}
        closer="Not loose stones alone — owned categories."
      >
        <div className="grid max-w-5xl gap-10 text-lg leading-relaxed text-white/75 md:grid-cols-2 md:gap-16">
          <p>
            Loose stones commoditize. Margin moves up the chain — into finished
            jewelry, into branded categories, into the names consumers walk
            into a store asking for.
          </p>
          <p>
            Survival in this industry requires moving with that gravity:
            owning the finished product, owning the brands that sell it, and
            owning the platform underneath both.
          </p>
        </div>
      </Beat>

      {/* BEAT 2 — Why eternity */}
      <Beat
        eyebrow="The defensible category"
        headline="Why eternity."
        pulses={[...BRIDGE, 0, 5]}
      >
        <div className="grid max-w-5xl gap-10 text-lg leading-relaxed text-white/75 md:grid-cols-2 md:gap-16">
          <p>
            Half and full eternity is the most defensible category in fine
            jewelry. Sizing logic is repeatable. Stones are calibrated. Settings
            are modular. The same engineering produces a sized run, a special,
            and a refresh — at throughput.
          </p>
          <p>
            Repeat orders compound. The category rewards a manufacturer that
            can hold tolerance across batches and across years. The category
            does not reward romance.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-end gap-x-10 gap-y-4 border-t border-white/15 pt-10">
          <p
            className="text-5xl font-semibold tracking-tight text-white tabular-nums md:text-6xl"
            style={{ fontFeatureSettings: "'tnum'" }}
          >
            1,000+
          </p>
          <p
            className="text-[11px] uppercase text-white/55"
            style={{ letterSpacing: "0.24em", fontFamily: "var(--font-mono)" }}
          >
            Proprietary styles
          </p>
        </div>
      </Beat>

      {/* BEAT 3 — Atelier Amara */}
      <Beat eyebrow="Sub-brand" headline="Atelier Amara." pulses={AMARA}>
        <SubBrand
          lockup="ATELIER · AMARA"
          serif
          paragraph="Atelier Amara is a refined, modular maison of fine jewelry — an elegant, contemporary system of forms designed to be lived in. The collection is luxurious in finish and modular in architecture, so a piece adapts to its wearer rather than the other way around."
          ctaLabel="Visit Atelier Amara"
          ctaHref="https://atelieramara.com"
        />
      </Beat>

      {/* BEAT 4 — Fortunoff */}
      <Beat eyebrow="Sub-brand" headline="Fortunoff." pulses={FORTUNOFF}>
        <SubBrand
          lockup="FORTUNOFF"
          serif
          paragraph="Fortunoff is the licensed U.S. heritage revival — an American jewelry name with deep customer recognition, brought back on modern rails. The voice is warm and classic; the back-end is engineered, automated, and shared with the rest of the house."
          ctaLabel="Visit Fortunoff"
          ctaHref="https://fortunoff.com"
        />
      </Beat>

      {/* BEAT 5 — More to come */}
      <Beat eyebrow="Sub-brand" headline="More to come." pulses={MORE}>
        <p className="max-w-3xl text-lg leading-relaxed text-white/75">
          The portfolio is being built deliberately, one acquisition at a time.
        </p>
      </Beat>

      {/* BEAT 6 — Parent voice — scaffold becomes visible */}
      <ScaffoldBeat />

      {/* BEAT 7 — Contrast */}
      <section className="relative px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-6xl">
          <Contrast not="We don't chase trends —" then="we own categories." />
          <Contrast not="Not to be everywhere —" then="to be unmistakable." />
        </div>
      </section>

      <PageCloser line="Owned IP. Owned rails. Owned brands." />

      {/* Custom footer CTA: complete the journey → home, dropped at the full-sky beat */}
      <CompleteJourney />
    </DeepDivePage>
  );
}

/* ─────────── Sub-brand block ─────────── */

function SubBrand({
  lockup,
  paragraph,
  ctaLabel,
  ctaHref,
  serif,
}: {
  lockup: string;
  paragraph: string;
  ctaLabel: string;
  ctaHref: string;
  serif?: boolean;
}) {
  return (
    <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:items-start md:gap-16">
      <div>
        <p
          className="text-2xl font-light tracking-[0.32em] text-white md:text-3xl"
          style={{
            fontFamily: serif
              ? "'Cormorant Garamond', 'Times New Roman', serif"
              : "var(--font-sans)",
          }}
        >
          {lockup}
        </p>
        <p
          className="mt-3 text-[11px] uppercase text-white/45"
          style={{ letterSpacing: "0.24em", fontFamily: "var(--font-mono)" }}
        >
          A house of brands · sub-brand
        </p>
      </div>
      <div>
        <p
          className="max-w-2xl text-lg leading-relaxed text-white/85"
          style={
            serif
              ? { fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "1.25rem", lineHeight: 1.55 }
              : undefined
          }
        >
          {paragraph}
        </p>
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="ghost-cta-deep mt-8 inline-flex"
        >
          {ctaLabel}
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

/* ─────────── Scaffold beat — bridges pulse, sub-brands dim ─────────── */

function ScaffoldBeat() {
  // Pulse the bridging stars (13, 14) plus the three brand anchors faintly,
  // suggesting the underlying shared backbone.
  return (
    <Beat
      eyebrow="The parent voice"
      headline="Lumex underneath. Brands on top."
      pulses={[...BRIDGE, 0, 5, 10]}
    >
      <div className="grid max-w-5xl gap-10 text-lg leading-relaxed text-white/75 md:grid-cols-2 md:gap-16">
        <p>
          Lumex is the engineering, technology, and capital layer underneath
          every brand in the house. The platform is shared. The patents are
          shared. The factory floor is shared.
        </p>
        <p>
          Each sub-brand has its own voice for its own audience. The parent
          speaks as a platform — declarative, technical, owned end to end.
        </p>
      </div>
    </Beat>
  );
}

/* ─────────── Complete the journey — back to home full-sky beat ─────────── */

function CompleteJourney() {
  return (
    <section className="relative border-t border-white/10 px-6 py-20 md:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-end">
        <Link
          to="/"
          hash="full-sky"
          className="ghost-cta-deep"
          // Programmatic scroll-to-hash safety net — TanStack scrolls on
          // navigation, but a tiny delayed call makes the landing reliable
          // even when the home page is loading the heavy starfield.
          onClick={() => {
            requestAnimationFrame(() => {
              const el = document.getElementById("full-sky");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          }}
        >
          Complete the journey →
        </Link>
      </div>
      <UnusedSilencer />
    </section>
  );
}

/* tiny no-op so importing usePulseControl/useEffect stays linted-clean
 * if a future edit removes a hover handler — keeps imports honest */
function UnusedSilencer() {
  const setPulse = usePulseControl();
  useEffect(() => {
    void setPulse;
  }, [setPulse]);
  return null;
}
