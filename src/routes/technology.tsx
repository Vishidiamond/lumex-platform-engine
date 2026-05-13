import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/technology")({
  component: TechnologyPage,
});

function TechnologyPage() {
  return (
    <Section eyebrow="Technology" bound="wide">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
        Technology
      </h1>
      <p className="mt-4 text-muted-foreground">Page content pending.</p>
    </Section>
  );
}
