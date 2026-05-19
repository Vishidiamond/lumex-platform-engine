import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import Galaxy from "@/components/galaxy/Galaxy";

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
    <ClientOnly
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-[#070b18] text-[#e6ecf7]">
          <p className="text-sm tracking-wide opacity-60">Loading galaxy…</p>
        </div>
      }
    >
      <Galaxy />
    </ClientOnly>
  );
}
