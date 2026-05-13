import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/jewelry")({
  component: JewelryPage,
});

function JewelryPage() {
  return (
    <Section eyebrow="Jewelry" bound="wide">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
        Jewelry
      </h1>
      <p className="mt-4 text-muted-foreground">Page content pending.</p>
    </Section>
  );
}
