import { createFileRoute } from "@tanstack/react-router";

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
    <section className="min-h-[calc(100vh-4rem)] flex items-end px-8 pb-24 pointer-events-none">
      <div className="max-w-xl text-[#e6ecf7] pointer-events-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-3">
          The Constellation
        </p>
        <h1 className="text-5xl md:text-6xl font-light leading-tight">
          One galaxy. <br />Five divisions.
        </h1>
      </div>
    </section>
  );
}
