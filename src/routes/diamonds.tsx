import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/diamonds")({
  component: DiamondsPage,
});

function DiamondsPage() {
  return (
    <Section eyebrow="Diamonds" bound="wide">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
        Diamonds
      </h1>
      <p className="mt-4 text-muted-foreground">Page content pending.</p>
    </Section>
  );
}
