import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/platform")({
  component: PlatformPage,
});

function PlatformPage() {
  return (
    <Section eyebrow="Platform" bound="wide">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
        Platform
      </h1>
      <p className="mt-4 text-muted-foreground">Page content pending.</p>
    </Section>
  );
}
