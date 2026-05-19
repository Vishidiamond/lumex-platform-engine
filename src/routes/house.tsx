import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/house")({
  component: HousePage,
  head: () => ({
    meta: [
      { title: "House — Lumex" },
      {
        name: "description",
        content:
          "A house of brands. One platform underneath. Atelier Amara, Fortunoff, and the next acquisition.",
      },
    ],
  }),
});

function HousePage() {
  return (
    <div className="text-[#e6ecf7]">
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/55 font-mono">
        House · A house of brands
      </p>
      <h1 className="mt-4 text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
        A house of brands. One platform underneath.
      </h1>

      <div className="mt-8 space-y-5 text-base leading-relaxed text-white/75">
        <p>
          Loose stones commoditize. Margin moves up the chain — into finished
          jewelry, into branded categories, into the names consumers walk
          into a store asking for.
        </p>
        <p>
          Survival requires moving with that gravity: owning the finished
          product, owning the brands that sell it, and owning the platform
          underneath both.
        </p>
      </div>

      <section className="mt-10 border-t border-white/15 pt-8 space-y-8">
        <BrandRow
          name="Atelier Amara"
          line="Refined, modular maison of fine jewelry — luxurious in finish, modular in architecture."
          to="/atelier-amara"
        />
        <BrandRow
          name="Fortunoff"
          line="Licensed U.S. heritage revival, brought back on modern rails."
          to="/fortunoff"
        />
        <BrandRow name="More to come" line="The portfolio is being built deliberately, one acquisition at a time." />
      </section>

      <p className="mt-10 text-base text-white/70">
        Lumex underneath. Brands on top. The platform is shared. The patents
        are shared. The factory floor is shared.
      </p>
    </div>
  );
}

function BrandRow({ name, line, to }: { name: string; line: string; to?: "/atelier-amara" | "/fortunoff" }) {
  return (
    <div>
      <p className="text-lg font-semibold text-white">{name}</p>
      <p className="mt-2 text-sm text-white/75 leading-relaxed">{line}</p>
      {to ? (
        <Link
          to={to}
          className="mt-3 inline-block text-[11px] uppercase tracking-[0.24em] text-white/70 hover:text-white font-mono"
        >
          Open →
        </Link>
      ) : null}
    </div>
  );
}
