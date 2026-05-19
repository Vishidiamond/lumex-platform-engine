import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/diamonds")({
  component: DiamondsPage,
  head: () => ({
    meta: [
      { title: "Diamonds — Lumex" },
      {
        name: "description",
        content:
          "Calibrated, machine-sorted, engineered for precision. 30 patented shapes.",
      },
    ],
  }),
});

function DiamondsPage() {
  return (
    <div className="text-[#e6ecf7]">
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/55 font-mono">
        Lattice · Loose diamonds
      </p>
      <h1 className="mt-4 text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
        Calibrated. Machine-sorted. Engineered for precision.
      </h1>

      <div className="mt-8 space-y-5 text-base leading-relaxed text-white/75">
        <p>
          Lumex loose diamonds are built to defensible tolerances, not
          described in adjectives. A patented shape is the difference between
          a commodity stone and a defensible product.
        </p>
        <p>
          Automated sorting machines classify fancy-shape and round diamonds
          for measurement and proportion. Throughput is high. Tolerances are
          tight. The output of every shift looks like the output of every
          other shift.
        </p>
      </div>

      <section className="mt-10 border-t border-white/15 pt-8 space-y-6">
        <Step n="01" t="Grown" l="HPHT growth under defined pressure and temperature, in controlled cycles." />
        <Step n="02" t="Sorted" l="Calibrated, machine-sorted by measurement and proportion. High throughput, tight tolerance." />
        <Step n="03" t="Cut" l="To defined cuts and tolerances. Geometry is the spec. The spec is the deliverable." />
      </section>

      <p className="mt-10 text-2xl font-light text-white/90">
        Precision is the product.
      </p>

      <Link
        to="/house"
        className="mt-12 inline-flex items-center gap-2 border border-white/30 px-5 py-3 text-sm font-mono uppercase tracking-[0.24em] text-white/90 hover:bg-white/[0.06] hover:border-white/55 transition-colors"
      >
        Continue → House
      </Link>
    </div>
  );
}

function Step({ n, t, l }: { n: string; t: string; l: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.24em] text-white/55 font-mono">
        {n} · {t}
      </p>
      <p className="mt-2 text-sm text-white/80 leading-relaxed">{l}</p>
    </div>
  );
}
