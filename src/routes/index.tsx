import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Starfield } from "@/components/site/Starfield";
import { Constellation, useInView } from "@/components/site/Constellation";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const SITE = "https://lumexconstellation.com";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Lumex Constellation" },
      {
        name: "description",
        content:
          "Lumex is rebuilding the diamond and jewelry industry from the ground up — owning the AI that designs it, the platform that trades it, and the brands that sell it.",
      },
      { property: "og:title", content: "Lumex Constellation" },
      {
        property: "og:description",
        content:
          "Four divisions. One sky. The future of diamonds and jewelry, mapped.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/` }],
  }),
});

function Index() {
  return (
    <div className="relative bg-[#070b18] text-[#e6ecf7]">
      <Starfield />
      <Beat0 />
      <Beat1 />
      <Beat2 />
      <BeatArrival
        eyebrow="Constellation: Rails"
        pattern="rails"
        headline="The rails the trade now runs on."
        subhead="Not a marketplace. Not a website. Infrastructure."
        body={
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <Proof title="Brokers" line="Included, not disintermediated. A path forward, not a workaround." />
            <Proof title="Banks" line="Connected to the trade through one digital layer." />
            <Proof title="Logistics" line="Movement of stones, tracked across the network." />
          </div>
        }
        closer="Infrastructure, not a website."
        primaryCta={{ label: "Visit Lumex.online", href: "https://lumex.online", external: true }}
        secondaryCta={{ label: "See the platform", to: "/platform" }}
      />
      <BeatTransit line="Underneath every transaction — a layer of intelligence." />
      <BeatArrival
        eyebrow="Constellation: Sphere"
        pattern="sphere"
        headline="AI is not a feature at Lumex. It is the layer underneath everything."
        subhead="NSphere holds the patent for AI-driven CAD merging — and its generation extension."
        body={
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <Proof title="30" line="Patented diamond shapes." />
            <Proof title="1,000+" line="Proprietary jewelry styles." />
            <Proof title="Automated" line="Sorting from the factory floor." />
          </div>
        }
        closer="The future of design is owned."
        secondaryCta={{ label: "See the technology", to: "/technology" }}
      />
      <BeatTransit line="Precision is the product." />
      <BeatArrival
        eyebrow="Constellation: Lattice"
        pattern="lattice"
        headline="Calibrated. Machine-sorted. Engineered for precision."
        subhead="30 patented shapes. Tight tolerances. Defensible cuts."
        closer="Precision is the product."
        secondaryCta={{ label: "See the diamonds", to: "/diamonds" }}
      />
      <BeatTransit line="The category moves up the value chain." />
      <BeatArrival
        eyebrow="Constellation: House"
        pattern="house"
        headline="A house of brands. One platform underneath."
        subhead="Atelier Amara. Fortunoff. The next acquisition. The engineering, technology, and capital backbone is shared."
        body={<BrandsRow />}
        closer="Owned IP. Owned rails. Owned brands."
        secondaryCta={{ label: "Explore the brands", to: "/house" }}
      />
      <Beat10 />
    </div>
  );
}

/* ───────────────────────── BEATS ───────────────────────── */

function Beat0() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="animate-fade-in-slow">
        <p
          className="text-sm uppercase text-white/90"
          style={{ letterSpacing: "0.42em", fontFamily: "var(--font-mono)" }}
        >
          Lumex Constellation.
        </p>
        <p className="mt-6 text-base text-white/55 md:text-lg" style={{ animationDelay: "1.2s" }}>
          The future of diamonds and jewelry, mapped.
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-12 flex flex-col items-center gap-8">
        <ul
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-2 text-[10px] text-white/40"
          style={{ letterSpacing: "0.36em", fontFamily: "var(--font-mono)" }}
        >
          <li>PLATFORM</li>
          <li aria-hidden>·</li>
          <li>TECHNOLOGY</li>
          <li aria-hidden>·</li>
          <li>DIAMONDS</li>
          <li aria-hidden>·</li>
          <li>BRANDS</li>
        </ul>
        <div className="flex flex-col items-center gap-2 text-[10px] text-white/45" style={{ letterSpacing: "0.32em", fontFamily: "var(--font-mono)" }}>
          <span>SCROLL</span>
          <ArrowDown className="h-4 w-4 animate-bounce" />
        </div>
      </div>

      <style>{`
        @keyframes lumex-fade-in-slow { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .animate-fade-in-slow { animation: lumex-fade-in-slow 1.4s ease-out 0.6s both; }
      `}</style>
    </section>
  );
}

function Beat1() {
  return (
    <section className="relative flex min-h-screen items-center px-6 md:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <p className="eyebrow !text-white/45">Mission</p>
        <h2 className="mt-6 max-w-4xl text-3xl font-semibold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
          Rebuilding the diamond and jewelry industry from the ground up.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-white/65">
          The AI that designs it. The platform that trades it. The brands that sell it.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="https://lumex.online"
            target="_blank"
            rel="noopener noreferrer"
            className="ghost-cta"
          >
            Enter Lumex.online
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a href="#beat-2" className="ghost-cta">Begin the journey</a>
        </div>
      </div>
    </section>
  );
}

function Beat2() {
  return (
    <section
      id="beat-2"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center"
    >
      <p className="eyebrow !text-white/45">The map</p>
      <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white md:text-4xl">
        Four divisions. One sky.
      </h2>

      <div className="relative mt-12 w-full max-w-5xl">
        <MiniSky />
      </div>

      <p className="mt-12 max-w-2xl text-lg text-white/65">
        We don&rsquo;t follow the market — we build ahead of it.
      </p>
    </section>
  );
}

function BeatTransit({ line }: { line: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  return (
    <section className="relative flex min-h-[60vh] items-center justify-center px-6 text-center">
      <div
        ref={ref}
        className={cn(
          "max-w-3xl text-balance text-xl font-light leading-snug text-white/70 transition-all duration-1000 md:text-3xl",
          inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        {line}
      </div>
    </section>
  );
}

interface CtaTo {
  label: string;
  to: string;
  external?: false;
  href?: never;
}
interface CtaHref {
  label: string;
  href: string;
  external?: true;
  to?: never;
}
type Cta = CtaTo | CtaHref;

function BeatArrival({
  eyebrow,
  pattern,
  headline,
  subhead,
  body,
  closer,
  primaryCta,
  secondaryCta,
}: {
  eyebrow: string;
  pattern: "rails" | "sphere" | "lattice" | "house";
  headline: string;
  subhead: string;
  body?: ReactNode;
  closer: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center px-6 py-24 md:px-10"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div className="order-2 lg:order-1">
          <p className="eyebrow !text-white/45">{eyebrow}</p>
          <h2
            className={cn(
              "mt-6 text-3xl font-semibold leading-[1.05] tracking-tight text-white transition-all duration-700 md:text-5xl",
              inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            {headline}
          </h2>
          <p
            className={cn(
              "mt-6 max-w-xl text-lg text-white/65 transition-all duration-700 delay-100",
              inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            {subhead}
          </p>
          {body}
          <p className="mt-12 text-sm uppercase text-white/55" style={{ letterSpacing: "0.28em", fontFamily: "var(--font-mono)" }}>
            {closer}
          </p>
          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {primaryCta ? <CtaButton cta={primaryCta} variant="solid" /> : null}
              {secondaryCta ? <CtaButton cta={secondaryCta} variant="ghost" /> : null}
            </div>
          )}
        </div>
        <div className="order-1 lg:order-2">
          <div className="aspect-[5/3] w-full">
            <Constellation pattern={pattern} active={inView} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Beat10() {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  return (
    <section
      ref={ref}
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center"
    >
      <p className="eyebrow !text-white/45">The full sky</p>
      <div className="mt-10 w-full max-w-5xl">
        <FullSky active={inView} />
      </div>
      <h2
        className={cn(
          "mt-12 max-w-3xl text-3xl font-semibold leading-[1.05] tracking-tight text-white transition-all duration-1000 md:text-5xl",
          inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        Four constellations. One sky.
      </h2>

      <div className="mt-14 w-full max-w-5xl border-y border-white/10 py-6">
        <ul
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/70"
          style={{ letterSpacing: "0.18em", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}
        >
          <li>30 patented diamond shapes</li>
          <li aria-hidden className="text-white/25">·</li>
          <li>1,000+ proprietary styles</li>
          <li aria-hidden className="text-white/25">·</li>
          <li>200+ active clients</li>
          <li aria-hidden className="text-white/25">·</li>
          <li>20+ geographies</li>
        </ul>
      </div>

      <p className="mt-16 text-sm uppercase text-white/55" style={{ letterSpacing: "0.32em", fontFamily: "var(--font-mono)" }}>
        Lumex — The Future.
      </p>

      <style>{`
        .ghost-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid rgba(255,255,255,0.25);
          padding: 0.7rem 1.1rem;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.9);
          transition: background-color .2s ease, border-color .2s ease, color .2s ease;
          border-radius: 2px;
        }
        .ghost-cta:hover { background-color: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.55); }
        .solid-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: white; color: #0b1426;
          padding: 0.7rem 1.1rem; font-size: 0.875rem; font-weight: 500;
          border-radius: 2px;
          transition: background-color .2s ease;
        }
        .solid-cta:hover { background: #dbe6ff; }
      `}</style>
    </section>
  );
}

/* ───────────────────────── PARTS ───────────────────────── */

function CtaButton({ cta, variant }: { cta: Cta; variant: "solid" | "ghost" }) {
  const cls = variant === "solid" ? "solid-cta" : "ghost-cta";
  if ("href" in cta && cta.href) {
    return (
      <a
        href={cta.href}
        target={cta.external ? "_blank" : undefined}
        rel={cta.external ? "noopener noreferrer" : undefined}
        className={cls}
      >
        {cta.label}
        {cta.external ? <ArrowUpRight className="h-4 w-4" /> : null}
      </a>
    );
  }
  return (
    <Link to={cta.to! as "/platform"} className={cls}>
      {cta.label}
    </Link>
  );
}

function Proof({ title, line }: { title: string; line: string }) {
  return (
    <div className="border-t border-white/15 pt-4">
      <p
        className="text-xs uppercase text-white/55"
        style={{ letterSpacing: "0.24em", fontFamily: "var(--font-mono)" }}
      >
        {title}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-white/80">{line}</p>
    </div>
  );
}

function BrandsRow() {
  const items = [
    {
      title: "Atelier Amara",
      line: "An in-house luxury maison built on a modular system — refined, modern, owned end-to-end.",
    },
    {
      title: "Fortunoff",
      line: "An American jewelry heritage, revived on modern rails.",
    },
    {
      title: "More to come",
      line: "The next acquisition. Plugged into the same engineering and capital backbone.",
    },
  ];
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-3">
      {items.map((b) => (
        <div key={b.title} className="border-t border-white/15 pt-4">
          <p
            className="text-xs uppercase text-white/65"
            style={{ letterSpacing: "0.22em", fontFamily: "var(--font-mono)" }}
          >
            {b.title}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/75">{b.line}</p>
        </div>
      ))}
    </div>
  );
}

/* The mini-map shown in beat 2: all four constellations laid out faintly. */
function MiniSky() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  return (
    <div ref={ref} className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {(["rails", "sphere", "lattice", "house"] as const).map((p, i) => (
        <div
          key={p}
          className={cn(
            "aspect-[5/3] rounded-sm border border-white/10 bg-white/[0.02] p-4 transition-all duration-700",
            inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
          style={{ transitionDelay: `${i * 120}ms` }}
        >
          <Constellation pattern={p} active={inView} />
          <p
            className="mt-2 text-[10px] uppercase text-white/55"
            style={{ letterSpacing: "0.28em", fontFamily: "var(--font-mono)" }}
          >
            {labelFor(p)}
          </p>
        </div>
      ))}
    </div>
  );
}

function FullSky({ active }: { active: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {(["rails", "sphere", "lattice", "house"] as const).map((p) => (
        <div key={p} className="aspect-[5/3]">
          <Constellation pattern={p} active={active} />
        </div>
      ))}
    </div>
  );
}

function labelFor(p: "rails" | "sphere" | "lattice" | "house") {
  switch (p) {
    case "rails": return "Rails · Platform";
    case "sphere": return "Sphere · Technology";
    case "lattice": return "Lattice · Diamonds";
    case "house": return "House · Brands";
  }
}
