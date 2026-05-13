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

export const Route = createFileRoute("/platform")({
  component: PlatformPage,
  head: () => ({
    meta: [
      { title: "Platform — Lumex" },
      {
        name: "description",
        content:
          "Lumex.online connects the diamond industry — brokers, banks, and logistics — on a single set of rails.",
      },
      { property: "og:title", content: "Platform — Lumex" },
      {
        property: "og:description",
        content: "The platform the trade now runs on.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/platform` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/platform` }],
  }),
});

function PlatformPage() {
  return (
    <DeepDivePage division="rails">
      <DeepDiveHero
        num="01"
        name="Rails"
        headline="The platform the trade now runs on."
        subhead="Lumex.online connects the diamond industry — brokers, banks, and logistics — on a single set of rails."
        ctaLabel="Enter Lumex.online"
        ctaHref="https://lumex.online"
        ctaExternal
      />

      {/* BEAT 1 — center star pulses */}
      <Beat
        eyebrow="What it is"
        headline="Not a marketplace. Not a website. Infrastructure."
        pulses={[4]}
        closer="Infrastructure, not a website."
      >
        <div className="grid max-w-5xl gap-6 text-lg leading-relaxed text-white/75 md:grid-cols-2 md:gap-10">
          <p>
            Lumex.online is the layer the category will run on. Stones, brands,
            and counterparties change. The rails do not. The company that owns
            the rails owns the flow on top of them.
          </p>
          <p>
            The platform is built as infrastructure first and product second —
            an open connective tissue between the people who price diamonds,
            the banks that finance them, and the logistics that move them. It
            is the layer underneath, not another storefront on top.
          </p>
        </div>
      </Beat>

      {/* BEAT 2 — end stars + midpoint pulse */}
      <Beat
        eyebrow="Who's on the rails"
        headline="Three networks. One layer."
        pulses={[0, 4, 9]}
      >
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          <NetworkCard
            label="Brokers"
            line="The lifeblood of the trade. Now with a digital path forward."
          />
          <NetworkCard
            label="Banks"
            line="Settlement and financing, integrated into the flow of trade."
          />
          <NetworkCard
            label="Logistics"
            line="Movement, insurance, and chain of custody — on the same layer."
          />
        </div>
      </Beat>

      {/* BEAT 3 — Contrast block */}
      <section className="relative px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-6xl">
          <Contrast
            not="We don't replace brokers —"
            then="we give them a path forward."
          />
          <Contrast
            not="We don't digitize the industry against itself —"
            then="we digitize it with itself."
          />
        </div>
      </section>

      {/* BEAT 4 — Sequence */}
      <Beat
        eyebrow="How it works"
        headline="List. Match. Settle. Move."
        pulses={[2, 4, 6, 8]}
      >
        <Sequence
          steps={[
            { n: "01", title: "List", line: "Inventory enters the platform with calibrated specifications and verified provenance." },
            { n: "02", title: "Match", line: "Counterparties find inventory by parameter, not by phone tree." },
            { n: "03", title: "Settle", line: "Banking and settlement clear inside the same digital layer." },
            { n: "04", title: "Move", line: "Shipment, insurance, and chain of custody execute on a connected pipeline." },
          ]}
        />
      </Beat>

      {/* BEAT 5 — Proof bar */}
      <section className="relative px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p
            className="mb-8 text-xs uppercase text-white/45"
            style={{ letterSpacing: "0.28em", fontFamily: "var(--font-mono)" }}
          >
            Proof
          </p>
          <ProofBar
            items={[
              { value: "200+", label: "Active clients" },
              { value: "20+", label: "Geographies" },
              { value: "[X]", label: "Stones listed" },
              { value: "[X]", label: "Transactions cleared" },
            ]}
          />
        </div>
      </section>

      <PageCloser line="Owned IP. Owned rails. Owned brands." />

      <ContinueJourney to="/technology" label="Continue the journey →" />
    </DeepDivePage>
  );
}

/* ─────────── Local parts ─────────── */

function NetworkCard({ label, line }: { label: string; line: string }) {
  return (
    <div className="border-t border-white/15 pt-5">
      <p
        className="text-xs uppercase text-white/65"
        style={{ letterSpacing: "0.24em", fontFamily: "var(--font-mono)" }}
      >
        {label}
      </p>
      <p className="mt-4 max-w-xs text-base leading-relaxed text-white/80">{line}</p>
    </div>
  );
}

function Sequence({
  steps,
}: {
  steps: { n: string; title: string; line: string }[];
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute left-0 right-0 top-3 hidden h-px bg-white/15 md:block"
      />
      <div className="relative grid gap-10 md:grid-cols-4 md:gap-6">
        {steps.map((s) => (
          <div key={s.n} className="relative">
            <span
              aria-hidden
              className="block h-2 w-2 rounded-full bg-white"
              style={{ marginTop: "0.5rem" }}
            />
            <p
              className="mt-5 text-[11px] uppercase text-white/55"
              style={{ letterSpacing: "0.28em", fontFamily: "var(--font-mono)" }}
            >
              {s.n} · {s.title}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/80">
              {s.line}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
