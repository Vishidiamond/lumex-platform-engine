import { createFileRoute } from "@tanstack/react-router";
import {
  DeepDivePage,
  DeepDiveHero,
  Beat,
  Contrast,
  ProofBar,
  PageCloser,
  ContinueJourney,
} from "@/components/site/DeepDive";

const SITE = "https://lumexconstellation.com";

export const Route = createFileRoute("/technology")({
  component: TechnologyPage,
  head: () => ({
    meta: [
      { title: "Technology — Lumex" },
      {
        name: "description",
        content:
          "AI is not a feature at Lumex. It is the layer underneath everything. NSphere holds the patent for AI-driven CAD merging and its generation extension.",
      },
      { property: "og:title", content: "Technology — Lumex" },
      {
        property: "og:description",
        content: "NSphere. The patent layer underneath modern jewelry design.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/technology` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/technology` }],
  }),
});

function TechnologyPage() {
  return (
    <DeepDivePage division="sphere">
      <DeepDiveHero
        num="02"
        name="Sphere"
        headline="AI is not a feature at Lumex. It is the layer underneath everything."
        subhead="NSphere holds the patent for AI-driven CAD merging — and its generation extension."
      />

      {/* BEAT 1 — NSphere. Center star pulses. */}
      <Beat
        eyebrow="NSphere"
        headline="NSphere."
        pulses={[0]}
      >
        <p
          className="mb-10 text-base uppercase text-white/60"
          style={{ letterSpacing: "0.24em", fontFamily: "var(--font-mono)" }}
        >
          The patent layer underneath modern jewelry design.
        </p>
        <div className="grid max-w-5xl gap-10 text-lg leading-relaxed text-white/75 md:grid-cols-3">
          <p>
            CAD merging takes two or more existing digital jewelry models and
            combines them — geometry, topology, and constraints — into a new
            valid model. NSphere holds the patent for performing this merge
            with AI in the loop.
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
      </Beat>

      {/* BEAT 2 — Two outer stars pulse, one per column. */}
      <Beat
        eyebrow="Technology from the factory floor"
        headline="Technology is the operating system, not a department."
        pulses={[10, 22]}
      >
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <PillarCard
            label="Automated sorting"
            line="Machines classify fancy-shape and round diamonds for measurement and proportion. Tight tolerances across every stone."
          />
          <PillarCard
            label="Platform engineering"
            line="Lumex.online is the trade's rails. Built, maintained, and owned in-house."
          />
        </div>
      </Beat>

      {/* BEAT 3 — Contrast block */}
      <section className="relative px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-6xl">
          <Contrast
            not="Most companies will eventually add AI."
            then="We were built around it."
          />
          <Contrast
            not="We don't model the industry —"
            then="we own the layer it runs on."
          />
        </div>
      </section>

      {/* BEAT 4 — The IP moat. Five stars pulse. */}
      <Beat
        eyebrow="The IP moat"
        headline="The moat is owned IP."
        pulses={[1, 3, 5, 12, 18]}
      >
        <ProofBar
          items={[
            { value: "30", label: "Patented diamond shapes" },
            { value: "1,000+", label: "Proprietary jewelry styles" },
            { value: "1", label: "CAD merging patent" },
            { value: "1", label: "Generation extension" },
          ]}
        />
        <div className="mt-10 grid gap-10 border-b border-white/15 pb-10 md:grid-cols-[1fr_2fr] md:items-end md:gap-16">
          <p
            className="text-4xl font-semibold tracking-tight text-white tabular-nums md:text-5xl"
            style={{ fontFeatureSettings: "'tnum'" }}
          >
            1
          </p>
          <p
            className="text-[11px] uppercase text-white/55"
            style={{ letterSpacing: "0.24em", fontFamily: "var(--font-mono)" }}
          >
            Patented modular system in Atelier Amara
          </p>
        </div>
      </Beat>

      {/* BEAT 5 — Why this matters now */}
      <Beat
        eyebrow="Why this matters now"
        headline="The next decade of jewelry will be designed differently."
        pulses={[0, 2, 4]}
        closer="Built around AI."
      >
        <div className="grid max-w-5xl gap-10 text-lg leading-relaxed text-white/75 md:grid-cols-2">
          <p>
            AI will redesign how the industry produces jewelry — from the
            generation of new forms, to the merging of existing libraries, to
            the manufacturing pipeline that follows.
          </p>
          <p>
            Lumex already owns the foundational IP underneath that redesign.
            The patents are filed. The platform is in production. The factory
            floor is automated.
          </p>
        </div>
      </Beat>

      <PageCloser line="The design layer is owned." />

      <ContinueJourney to="/diamonds" label="Continue the journey →" />
    </DeepDivePage>
  );
}

function PillarCard({ label, line }: { label: string; line: string }) {
  return (
    <div className="border-t border-white/15 pt-5">
      <p
        className="text-xs uppercase text-white/65"
        style={{ letterSpacing: "0.24em", fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">{line}</p>
    </div>
  );
}
